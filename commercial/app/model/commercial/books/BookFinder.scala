package model.commercial.books

import akka.pattern.CircuitBreaker
import common.{AkkaAgent, ExecutionContexts, Logging}
import conf.Configuration
import conf.Switches.GuBookshopFeedsSwitch
import model.commercial.{FeedReader, FeedRequest}
import play.api.Play.current
import play.api.libs.concurrent.Akka
import play.api.libs.json._
import play.api.libs.oauth.{ConsumerKey, OAuthCalculator, RequestToken}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

object BookFinder extends ExecutionContexts with Logging {

  private lazy val agent = AkkaAgent[Map[String, Book]](Map.empty[String, Book])

  private final val circuitBreaker = new CircuitBreaker(
    scheduler = Akka.system.scheduler,
    maxFailures = 10,
    callTimeout = 4.seconds,
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

  def findByIsbn(isbn: String): Option[Book] = {
    val maybeBook = agent.get().get(isbn)

    if (maybeBook.isEmpty) {
      for {
        lookUpResult <- circuitBreaker.withCircuitBreaker(MagentoService.findByIsbn(isbn))
        foundBook <- lookUpResult
      } agent.send { books => books + (isbn -> foundBook)}
    }

    maybeBook
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

  private implicit val singleThreadExecutionContext: ExecutionContext =
    Akka.system.dispatchers.lookup("play.akka.actor.single-thread")

  def findByIsbn(isbn: String): Future[Option[Book]] = {

    val result = magentoProperties map { props =>

      val request = FeedRequest(
        feedName = "Book Lookup",
        url = Some(s"${props.urlPrefix}/$isbn"),
        timeout = 5.seconds,
        switch = GuBookshopFeedsSwitch)

      FeedReader.read(request,
        signature = Some(props.oauth),
        validResponseStatuses = Seq(200, 404)) { responseBody =>
        val json = Json.parse(responseBody)
          json.validate[Book] match {
            case JsError(e) =>
              MagentoException(json) match {
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
            case JsSuccess(book, _) => Some(book)
          }
      }.map(_.flatten)
    }

    result getOrElse {
      log.warn("MagentoService is not configured")
      Future.successful(None)
    }
  }
}
