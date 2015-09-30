package model.commercial.books

import akka.pattern.CircuitBreaker
import common.ExecutionContexts.memcachedExecutionContext
import common.{ExecutionContexts, Logging}
import conf.Configuration
import conf.switches.Switches.BookLookupSwitch
import model.commercial.{FeedParseException, FeedReadException, FeedReader, FeedRequest}
import play.api.Play.current
import play.api.libs.concurrent.Akka
import play.api.libs.json._
import play.api.libs.oauth.{ConsumerKey, OAuthCalculator, RequestToken}
import play.api.libs.ws.WSSignatureCalculator
import shade.memcached.{Configuration => MemcachedConfiguration, Memcached, MemcachedCodecs}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

object BookFinder extends ExecutionContexts with Logging {

  def findByIsbn(isbn: String,
                 cache: BookDataCache = MemcachedBookDataCache,
                 lookup: String => Future[Option[JsValue]] = MagentoService.findByIsbn):
  Future[Option[Book]] = {

    def cachedBook(bookData: JsValue): Future[Option[Book]] = {
      Future.successful {
        bookData match {
          case JsNull => None
          case _ =>
            bookData.validate[Book] fold(
              invalid => {
                log.error(Json.stringify(JsError.toJson(invalid)))
                None
              },
              book => Some(book))
        }
      }
    }

    lazy val lookedUpBook = {
      lookup(isbn) map {
        _ map { bookData =>
          cache.add(isbn, bookData)
          bookData.as[Book]
        } orElse {
          cache.add(isbn, JsNull)
          None
        }
      }
    }

    cache.get(isbn) flatMap {
      _ map cachedBook getOrElse lookedUpBook
    } recoverWith {
      case NonFatal(e) => lookedUpBook
    }
  }
}


object MagentoService extends Logging {

  private case class MagentoProperties(oauth: WSSignatureCalculator, urlPrefix: String)

  private val magentoProperties = {
    for {
      domain <- Configuration.commercial.magento.domain
      path <- Configuration.commercial.magento.isbnLookupPath
      consumerKey <- Configuration.commercial.magento.consumerKey
      consumerSecret <- Configuration.commercial.magento.consumerSecret
      token <- Configuration.commercial.magento.accessToken
      tokenSecret <- Configuration.commercial.magento.accessTokenSecret
    } yield MagentoProperties(
      oauth = OAuthCalculator(
        consumerKey = ConsumerKey(consumerKey, consumerSecret),
        token = RequestToken(token, tokenSecret)
      ),
      urlPrefix = s"http://$domain/$path"
    )
  }

  private implicit val bookLookupExecutionContext: ExecutionContext =
    Akka.system.dispatchers.lookup("akka.actor.book-lookup")

  private final val circuitBreaker = new CircuitBreaker(
    scheduler = Akka.system.scheduler,
    maxFailures = 10,
    callTimeout = 5.seconds,
    resetTimeout = 1.minute
  )

  circuitBreaker.onOpen(
    log.error("Book lookup circuit breaker tripped: Open")
  )

  circuitBreaker.onHalfOpen(
    log.info("Book lookup circuit breaker tentatively trying again: Half Open")
  )

  circuitBreaker.onClose(
    log.info("Book lookup circuit breaker safe: Closed.")
  )

  def findByIsbn(isbn: String): Future[Option[JsValue]] = {

    def lookup(isbn: String): Future[Option[JsValue]] = {

      val result = magentoProperties map { props =>

        val request = FeedRequest(
          feedName = "Book Lookup",
          url = s"${props.urlPrefix}/$isbn",
          timeout = 3.seconds,
          switch = BookLookupSwitch)

        log.info(s"Looking up book with ISBN $isbn ...")

        FeedReader.read(request,
          signature = Some(props.oauth),
          validResponseStatuses = Seq(200, 404)) { responseBody =>
          val bookJson = Json.parse(responseBody)
          bookJson.validate[Book] match {
            case JsError(e) =>
              MagentoException(bookJson) match {
                case Some(me) if me.code == 404 =>
                  log.warn(s"MagentoService could not find isbn $isbn")
                  None
                case Some(me) =>
                  throw FeedReadException(request, me.code, me.message)
                case None =>
                  val jsonErr = JsError.toJson(e).toString()
                  throw FeedParseException(request, jsonErr)
              }
            case JsSuccess(book, _) => Some(bookJson)
          }
        }
      }

      result getOrElse {
        log.warn("MagentoService is not configured")
        Future.successful(None)
      }
    }

    circuitBreaker.withCircuitBreaker(lookup(isbn))
  }

}


trait BookDataCache {
  def get(isbn: String): Future[Option[JsValue]]
  def add(isbn: String, json: JsValue): Future[Boolean]
}

object MemcachedBookDataCache extends BookDataCache with Logging with MemcachedCodecs {

  private implicit lazy val executionContext = memcachedExecutionContext
  private implicit val stringCodec = StringBinaryCodec

  private lazy val maybeCache: Option[Memcached] = {
    val maybeHost = Configuration.memcached.host
    for (host <- maybeHost) yield {
      val config = MemcachedConfiguration(
        addresses = host,
        keysPrefix = Some("model.commercial.book")
      )
      Memcached(config, memcachedExecutionContext)
    }
  }

  private def withCache[T](action: Memcached => Future[T]): Future[T] = {
    maybeCache map action getOrElse {
      Future.failed(CacheNotConfiguredException("Memcached"))
    }
  }

  def get(isbn: String): Future[Option[JsValue]] = withCache { cache =>
    val bookData = cache.get[String](isbn) map (_ map Json.parse)
    bookData onFailure {
      case NonFatal(e) => log.error(s"Fetching book from cache failed: ${e.getMessage}")
    }
    bookData
  }

  def add(isbn: String, json: JsValue): Future[Boolean] = withCache { cache =>
    log.info(s"Caching book: $isbn -> $json")
    val bookData = cache.add(isbn, Json.stringify(json), 15.minutes)
    bookData onSuccess {
      case result if !result => log.error(s"Caching book $isbn failed: not added to cache")
    }
    bookData onFailure {
      case NonFatal(e) => log.error(s"Caching book $isbn failed : ${e.getMessage}")
    }
    bookData
  }
}

case class CacheNotConfiguredException(cacheName:String) extends Exception {
  override val getMessage: String = s"$cacheName cache not configured"
}
