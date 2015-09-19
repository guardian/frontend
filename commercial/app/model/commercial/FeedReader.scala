package model.commercial

import com.ning.http.client.{Response => AHCResponse}
import common.Logging
import conf.Switch
import model.diagnostics.CloudWatch
import play.api.Play.current
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WS, WSSignatureCalculator}

import scala.concurrent.duration.{Duration, _}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal
import scala.xml.{Elem, XML}

object FeedReader extends Logging {

  def read[T](request: FeedRequest,
              signature: Option[WSSignatureCalculator] = None,
              validResponseStatuses: Seq[Int] = Seq(200))
             (parse: String => T)
             (implicit ec: ExecutionContext): Future[T] = {

    def readUrl(): Future[T] = {

      def recordLoad(duration: Long): Unit = {
        val feedName = request.feedName.toLowerCase.replaceAll("\\s+", "-")
        val key = s"$feedName-feed-load-time"
        CloudWatch.put("Commercial", Map(s"$key" -> duration.toDouble))
      }

      val start = System.currentTimeMillis

      val requestHolder = {
        val unsignedRequestHolder = WS.url(request.url)
          .withQueryString(request.parameters.toSeq: _*)
          .withRequestTimeout(request.timeout.toMillis.toInt)
        signature.foldLeft(unsignedRequestHolder) { (soFar, calc) =>
          soFar.sign(calc)
        }
      }
      val futureResponse = requestHolder.get()

      val contents = futureResponse map { response =>
        response.status match {
          case status if validResponseStatuses.contains(status) =>
            recordLoad(System.currentTimeMillis - start)
            val body = request.responseEncoding map {
              response.underlying[AHCResponse].getResponseBody
            } getOrElse response.body
            parse(body)
          case invalid =>
            throw FeedReadException(request, response.status, response.statusText)
        }
      }

      contents onFailure {
        case NonFatal(e) => recordLoad(-1)
      }

      contents
    }

    request.switch.onInitialized flatMap { switch =>
      if (switch.isSwitchedOn) readUrl()
      else Future.failed(FeedSwitchOffException(request.feedName))
    }
  }

  def readSeq[T](request: FeedRequest)
                (parse: String => Seq[T])
                (implicit ec: ExecutionContext): Future[Seq[T]] = {
    val contents = read(request)(parse)

    contents onSuccess {
      case items => log.info(s"Loaded ${items.size} ${request.feedName} from ${request.url}")
    }

    contents onFailure {
      case e: FeedSwitchOffException => log.warn(e.getMessage)
      case NonFatal(e) => log.error(e.getMessage)
    }

    contents
  }

  def readSeqFromXml[T](request: FeedRequest)
                       (parse: Elem => Seq[T])
                       (implicit ec: ExecutionContext): Future[Seq[T]] = {
    readSeq(request) { body =>
      parse(XML.loadString(body))
    }
  }

  def readSeqFromJson[T](request: FeedRequest)
                        (parse: JsValue => Seq[T])
                        (implicit ec: ExecutionContext): Future[Seq[T]] = {
    readSeq(request) { body =>
      parse(Json.parse(body))
    }
  }
}


case class FeedRequest(feedName: String,
                       switch: Switch,
                       url: String,
                       parameters: Map[String, String] = Map.empty,
                       timeout: Duration = 2.seconds,
                       responseEncoding: Option[String] = None)


case class FeedSwitchOffException(feedName: String) extends Exception {
  override val getMessage: String = s"Reading $feedName feed failed: Switch is off"
}

case class FeedReadException(request: FeedRequest,
                             statusCode: Int,
                             statusText: String) extends Exception {
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
