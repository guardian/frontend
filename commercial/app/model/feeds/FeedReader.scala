package commercial.model.feeds

import commercial.CommercialMetrics
import common.GuLogging
import conf.switches.Switch
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse, WSSignatureCalculator}

import scala.concurrent.duration.Duration
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal
import scala.util.{Failure, Success, Try}
import scala.xml.{Elem, XML}

class FeedReader(wsClient: WSClient) extends GuLogging {

  def read[T](
      request: FeedRequest,
      signature: Option[WSSignatureCalculator] = None,
      validResponseStatuses: Seq[Int] = Seq(200),
  )(parse: String => T)(implicit ec: ExecutionContext): Future[T] = {

    def readUrl(): Future[T] = {

      def recordLoad(duration: Long): Unit = {
        val feedName: String = request.feedName.toLowerCase.replaceAll("\\s+", "-")
        val key: String = s"$feedName-feed-load-time"
        CommercialMetrics.metrics.put(Map(s"$key" -> duration.toDouble))
      }

      val start: Long = System.currentTimeMillis

      val requestHolder: WSRequest = {
        val unsignedRequestHolder: WSRequest = wsClient
          .url(request.url)
          .withQueryStringParameters(request.parameters.toSeq: _*)
          .withRequestTimeout(request.timeout)
        signature.foldLeft(unsignedRequestHolder) { (soFar, calc) =>
          soFar.sign(calc)
        }
      }
      val futureResponse: Future[WSResponse] = requestHolder.get()

      val contents: Future[T] = futureResponse map { response =>
        response.status match {
          case status if validResponseStatuses.contains(status) =>
            recordLoad(System.currentTimeMillis - start)
            val body: String = response.bodyAsBytes.decodeString(request.responseEncoding)

            Try(parse(body)) match {
              case Success(parsedBody) => parsedBody
              case Failure(throwable) =>
                log.error(s"Could not parse body: (Body: $body)", throwable)
                throw throwable
            }

          case invalid =>
            log.error(s"Invalid status code: ${response.status} (Response StatusText: ${response.statusText}")
            throw FeedReadException(request, response.status, response.statusText)
        }
      }

      contents.failed.foreach {
        case NonFatal(e) =>
          log.error(s"Failed to fetch feed contents.", e)
          recordLoad(-1)
      }

      contents
    }

    val initializedSwitch: Future[Switch] = request.switch.onInitialized

    initializedSwitch.onComplete {
      case Success(switch) =>
        log.info(s"Successfully initialized ${switch.name} (isSwitchedOn: ${switch.isSwitchedOn})")
      case Failure(throwable) => log.info(s"Failed to initialize switch.", throwable)
    }

    initializedSwitch flatMap { switch =>
      if (switch.isSwitchedOn) readUrl()
      else Future.failed(FeedSwitchOffException(request.feedName))
    }
  }

  def readSeq[T](request: FeedRequest)(parse: String => Seq[T])(implicit ec: ExecutionContext): Future[Seq[T]] = {
    val contents = read(request)(parse)

    contents foreach { items =>
      log.info(s"Loaded ${items.size} ${request.feedName} from ${request.url}")
    }

    contents.failed.foreach {
      case e: FeedSwitchOffException => log.warn(e.getMessage)
      case NonFatal(e)               => log.error(s"Failed to read feed ${request.feedName} with URL ${request.url}", e)
    }

    contents
  }

  def readSeqFromXml[T](request: FeedRequest)(parse: Elem => Seq[T])(implicit ec: ExecutionContext): Future[Seq[T]] = {
    readSeq(request) { body =>
      parse(XML.loadString(body))
    }
  }

  def readSeqFromJson[T](
      request: FeedRequest,
  )(parse: JsValue => Seq[T])(implicit ec: ExecutionContext): Future[Seq[T]] = {
    readSeq(request) { body =>
      parse(Json.parse(body))
    }
  }
}

case class FeedRequest(
    feedName: String,
    switch: conf.switches.Switch,
    url: String,
    parameters: Map[String, String] = Map.empty,
    responseEncoding: String,
    timeout: Duration,
)

case class FeedSwitchOffException(feedName: String) extends Exception {
  override val getMessage: String = s"Reading $feedName feed failed: Switch is off"
}

case class FeedReadException(request: FeedRequest, statusCode: Int, statusText: String) extends Exception {
  override val getMessage: String =
    s"Reading ${request.feedName} feed from ${request.url} failed: $statusCode: $statusText"
}

case class FeedParseException(request: FeedRequest, causeMessage: String) extends Exception {
  override val getMessage: String =
    s"Parsing ${request.feedName} feed from ${request.url} failed: $causeMessage"
}

case class FeedMissingConfigurationException(feedName: String) extends Exception {
  override val getMessage: String = s"Missing configuration for $feedName feed"
}
