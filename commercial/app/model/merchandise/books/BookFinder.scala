package commercial.model.merchandise.books

import akka.actor.ActorSystem
import akka.pattern.CircuitBreaker
import commercial.model.feeds.{FeedParseException, FeedReadException, FeedReader, FeedRequest}
import common.Logging
import conf.Configuration
import conf.switches.Switches.BookLookupSwitch
import commercial.model.merchandise.Book
import play.api.libs.json._
import play.api.libs.oauth.{ConsumerKey, OAuthCalculator, RequestToken}
import play.api.libs.ws.{WSClient, WSSignatureCalculator}
import shade.memcached.{Memcached, MemcachedCodecs, Configuration => MemcachedConfiguration}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

class BookFinder(actorSystem: ActorSystem, magentoService: MagentoService) extends Logging {

  private implicit lazy val executionContext = actorSystem.dispatchers.lookup("akka.actor.memcached")

  private lazy val defaultBookDataCache = new MemcachedBookDataCache(actorSystem)

  def findByIsbn(isbn: String,
                 cache: BookDataCache = defaultBookDataCache,
                 lookup: String => Future[Option[JsValue]] = magentoService.findByIsbn):
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


class MagentoService(actorSystem: ActorSystem, wsClient: WSClient) extends Logging {

  private case class MagentoProperties(oauth: WSSignatureCalculator, urlPrefix: String)

  private val feedReader = new FeedReader(wsClient)

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
    actorSystem.dispatchers.lookup("akka.actor.book-lookup")

  private final val circuitBreaker = new CircuitBreaker(
    scheduler = actorSystem.scheduler,
    maxFailures = 5,
    callTimeout = 3.seconds,
    resetTimeout = 5.minutes
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
          switch = BookLookupSwitch,
          responseEncoding = "utf-8")

        log.info(s"Looking up book with ISBN $isbn ...")

        feedReader.read(request,
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
                  log.warn(s"MegentoException: $me")
                  throw FeedReadException(request, me.code, me.message)
                case None =>
                  val jsonErr = JsError.toJson(e).toString()
                  log.warn(s"Unable to validate Book: $jsonErr")
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

class MemcachedBookDataCache(actorSystem: ActorSystem) extends BookDataCache with Logging with MemcachedCodecs {

  private implicit lazy val executionContext = actorSystem.dispatchers.lookup("akka.actor.memcached")
  private implicit val stringCodec = StringBinaryCodec

  private lazy val maybeCache: Option[Memcached] = {
    val maybeHost = Configuration.memcached.host
    for (host <- maybeHost) yield {
      val config = MemcachedConfiguration(
        addresses = host,
        keysPrefix = Some("commercial.model.merchandise.book")
      )
      Memcached(config, executionContext)
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
