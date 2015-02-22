package model.commercial.books

import akka.pattern.CircuitBreaker
import common.ExecutionContexts.memcachedExecutionContext
import common.{ExecutionContexts, Logging}
import conf.Configuration
import conf.Switches.GuBookshopFeedsSwitch
import model.commercial.{FeedReader, FeedRequest}
import play.api.Play.current
import play.api.libs.concurrent.Akka
import play.api.libs.json._
import play.api.libs.oauth.{ConsumerKey, OAuthCalculator, RequestToken}
import shade.memcached.{Configuration => MemcachedConfiguration, Memcached, MemcachedCodecs}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

object BookFinder extends ExecutionContexts with Logging {

  private final val circuitBreaker = new CircuitBreaker(
    scheduler = Akka.system.scheduler,
    maxFailures = 10,
    callTimeout = 2.seconds,
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

  def findByIsbn(isbn: String): Future[Option[Book]] = {
    val eventualMaybeBook = BookCache.get(isbn)

    for (maybeBook <- eventualMaybeBook)
      if (maybeBook.isEmpty) {
      for {
        maybeBookJson <- circuitBreaker.withCircuitBreaker(MagentoService.findByIsbn(isbn))
        bookJson <- maybeBookJson
      } {
        log.info(s"Caching book: $bookJson")
        BookCache.add(isbn, bookJson)
      }
    }

    eventualMaybeBook
  }
}


object MagentoService extends Logging {

  private case class MagentoProperties(oauth: OAuthCalculator, urlPrefix: String)

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
    Akka.system.dispatchers.lookup("play.akka.actor.book-lookup")

  def findByIsbn(isbn: String): Future[Option[JsValue]] = {

    val result = magentoProperties map { props =>

      val request = FeedRequest(
        feedName = "Book Lookup",
        url = Some(s"${props.urlPrefix}/$isbn"),
        timeout = 3.seconds,
        switch = GuBookshopFeedsSwitch)

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
                case Some(me) =>
                  val responseStatus = s"${me.code}: ${me.message}"
                  log.error(s"MagentoService failed to get ${request.url}: $responseStatus")
                case None =>
                  val jsonErr = JsError.toFlatJson(e).toString()
                  log.error(s"MagentoService failed to parse ${request.url}: $jsonErr")
              }
              None
            case JsSuccess(book, _) => Some(bookJson)
          }
      }.map(_.flatten)
    }

    result getOrElse {
      log.warn("MagentoService is not configured")
      Future.successful(None)
    }
  }
}


object BookCache extends Logging with MemcachedCodecs {

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
      log.warn("Cache not configured")
      Future.failed(CacheNotConfiguredException)
    }
  }

  def get(isbn: String): Future[Option[Book]] = withCache { cache =>
    val bookJson = cache.get[String](isbn)
    bookJson onFailure {
      case NonFatal(e) => log.error(s"Fetching book from cache failed: ${e.getMessage}")
    }
    bookJson map (_ map (Json.parse(_).as[Book]))
  }

  def add(isbn: String, json: JsValue): Future[Boolean] = withCache { cache =>
    val added = cache.add(isbn, Json.stringify(json), 15.minutes)
    added onFailure {
      case NonFatal(e) => log.error(s"Adding book to cache failed: ${e.getMessage}")
    }
    added
  }

  object CacheNotConfiguredException extends Exception
}
