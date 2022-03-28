package commercial.model.merchandise.books

import akka.actor.ActorSystem
import akka.pattern.CircuitBreaker
import akka.util.Timeout
import commercial.model.feeds.{FeedParseException, FeedReadException, FeedReader, FeedRequest}
import commercial.model.merchandise.Book
import common.{Box, GuLogging}
import conf.Configuration
import conf.switches.Switches.BookLookupSwitch
import play.api.libs.json._
import play.api.libs.oauth.{ConsumerKey, OAuthCalculator, RequestToken}
import play.api.libs.ws.{WSClient, WSSignatureCalculator}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

class BookFinder(actorSystem: ActorSystem, magentoService: MagentoService) extends GuLogging {

  private implicit val bookActorExecutionContext: ExecutionContext =
    actorSystem.dispatchers.lookup("akka.actor.book-lookup")
  private implicit val bookActorTimeout: Timeout = 0.2.seconds
  private implicit val magentoServiceImplicit = magentoService

  def findByIsbn(isbn: String): Option[Book] = BookAgent.get(isbn) map { _.as[Book] }
}

object BookAgent extends GuLogging {

  private lazy val cache = Box(Map.empty[String, JsValue])

  def get(
      isbn: String,
  )(implicit magentoService: MagentoService, executionContext: ExecutionContext): Option[JsValue] = {

    val bookJson: Option[JsValue] = cache.get.get(isbn)

    if (bookJson.isEmpty) {
      magentoService.findByIsbn(isbn) onComplete {
        case Failure(e)                   => log.error("Magento lookup failed.", e)
        case Success(None)                => log.warn(s"Magento unable to find book for $isbn.")
        case Success(Some(json: JsValue)) => cache alter { _ + (isbn -> json) }
      }
    }

    bookJson

  }
}

class MagentoService(actorSystem: ActorSystem, wsClient: WSClient) extends GuLogging {

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
        token = RequestToken(token, tokenSecret),
      ),
      urlPrefix = s"https://$domain/$path",
    )
  }

  private implicit val bookLookupExecutionContext: ExecutionContext =
    actorSystem.dispatchers.lookup("akka.actor.book-lookup")

  private final val circuitBreaker = new CircuitBreaker(
    scheduler = actorSystem.scheduler,
    maxFailures = 5,
    callTimeout = 3.seconds,
    resetTimeout = 5.minutes,
  )

  circuitBreaker.onOpen(
    log.error("Book lookup circuit breaker tripped: Open"),
  )

  circuitBreaker.onHalfOpen(
    log.info("Book lookup circuit breaker tentatively trying again: Half Open"),
  )

  circuitBreaker.onClose(
    log.info("Book lookup circuit breaker safe: Closed."),
  )

  def findByIsbn(isbn: String): Future[Option[JsValue]] = {

    def lookup(isbn: String): Future[Option[JsValue]] = {

      val result = magentoProperties map { props =>
        val request = FeedRequest(
          feedName = "Book Lookup",
          url = s"${props.urlPrefix}/$isbn",
          switch = BookLookupSwitch,
          responseEncoding = "utf-8",
          timeout = 4.seconds,
        )

        log.info(s"Looking up book with ISBN $isbn ...")

        feedReader.read(request, signature = Some(props.oauth), validResponseStatuses = Seq(200, 404)) { responseBody =>
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
            case JsSuccess(_, _) => Some(bookJson)
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
