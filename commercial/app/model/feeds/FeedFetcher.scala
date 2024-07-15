package commercial.model.feeds

import java.lang.System.currentTimeMillis

import conf.Configuration
import play.api.libs.json.{JsArray, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.duration.{Duration, _}
import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps
import scala.util.control.NonFatal

trait FeedFetcher {

  def wsClient: WSClient
  def feedMetaData: FeedMetaData
  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse]
  def fetch(feedMetaData: FeedMetaData)(implicit executionContext: ExecutionContext): Future[FetchResponse] = {

    def body(response: WSResponse): String = response.bodyAsBytes.decodeString(feedMetaData.responseEncoding)

    def contentType(response: WSResponse): String = response.header("Content-Type") getOrElse "application/octet-stream"

    val start = currentTimeMillis()

    val futureResponse = wsClient
      .url(feedMetaData.url)
      .withQueryStringParameters(feedMetaData.parameters.toSeq: _*)
      .withRequestTimeout(feedMetaData.timeout)
      .get()

    futureResponse map { response =>
      if (response.status == 200) {
        FetchResponse(
          Feed(body(response), contentType(response)),
          Duration(currentTimeMillis() - start, MILLISECONDS),
        )
      } else {
        throw FetchException(response.status, response.statusText)
      }
    } recoverWith { case NonFatal(e) =>
      Future.failed(e)
    }
  }
}

class SingleFeedFetcher(val wsClient: WSClient)(val feedMetaData: FeedMetaData) extends FeedFetcher {

  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse] = {
    fetch(feedMetaData)
  }
}

class FeedsFetcher(wsClient: WSClient) {

  private val jobs: Option[FeedFetcher] = {
    Configuration.commercial.jobsUrl map { url =>
      new SingleFeedFetcher(wsClient)(JobsFeedMetaData(url))
    }
  }

  private val travelOffers: Option[FeedFetcher] =
    Configuration.commercial.travelFeedUrl map { url =>
      new SingleFeedFetcher(wsClient)(TravelOffersFeedMetaData(url))
    }

  val all: Seq[FeedFetcher] = Seq(travelOffers, jobs).flatten

}

object ResponseEncoding {

  val iso88591 = "ISO-8859-1"
  val utf8 = "UTF-8"

  val default = iso88591
}

case class FetchResponse(feed: Feed, duration: Duration)
case class Feed(content: String, contentType: String)

final case class FetchException(status: Int, message: String) extends Exception(s"HTTP status $status: $message")

final case class SwitchOffException(switchName: String) extends Exception(s"$switchName switch is off")
