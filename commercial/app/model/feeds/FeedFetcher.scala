package commercial.model.feeds

import java.lang.System.currentTimeMillis

import conf.Configuration
import commercial.model.merchandise.events.Eventbrite.{Response => EbResponse}
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

    val futureResponse = wsClient.url(feedMetaData.url)
      .withQueryStringParameters(feedMetaData.parameters.toSeq: _*)
      .withRequestTimeout(feedMetaData.timeout)
      .get()

    futureResponse map { response =>
      if (response.status == 200) {
        FetchResponse(
          Feed(body(response), contentType(response)),
          Duration(currentTimeMillis() - start, MILLISECONDS)
        )
      } else {
        throw FetchException(response.status, response.statusText)
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }
}

class SingleFeedFetcher(val wsClient: WSClient)(val feedMetaData: FeedMetaData) extends FeedFetcher {

  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse] = {
    feedMetaData.fetchSwitch.isGuaranteedSwitchedOn flatMap { reallyOn =>
      if (reallyOn) {
        fetch(feedMetaData)
      } else Future.failed(SwitchOffException(feedMetaData.fetchSwitch.name))
    }
  }
}

class EventbriteMultiPageFeedFetcher(val wsClient: WSClient)(override val feedMetaData: EventsFeedMetaData) extends FeedFetcher {

  def fetchPage(index: Int)(implicit executionContext: ExecutionContext): Future[FetchResponse] = {
    fetch(feedMetaData.copy(additionalParameters = Map("page" -> index.toString)))
  }

  def combineFetchResponses(responses: Seq[FetchResponse]): FetchResponse ={

    val duration = responses.foldLeft(0 milliseconds)(
      (result, current: FetchResponse) => result + Duration(current.duration.toMillis, MILLISECONDS))

    val contents = responses.foldLeft(JsArray())(
      (result: JsArray, current: FetchResponse) => result :+ Json.parse(current.feed.content)
    )

    FetchResponse(
      Feed(
        contents.toString(),
        responses.head.feed.contentType
      ),
      duration
    )
  }

  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse] = {

    feedMetaData.fetchSwitch.isGuaranteedSwitchedOn flatMap { reallyOn =>
      if (reallyOn) {

        fetchPage(0) flatMap { initialFetch =>
          val pageCount = Json.parse(initialFetch.feed.content).as[EbResponse].pagination.pageCount
          val subsequentFetches = Future.traverse(2 to pageCount)(fetchPage)

          subsequentFetches map { fetches =>
            combineFetchResponses(initialFetch +: fetches)
          }
        }
      } else Future.failed(SwitchOffException(feedMetaData.fetchSwitch.name))
    }
  }
}

class FeedsFetcher(wsClient: WSClient) {


  private val jobs: Option[FeedFetcher] = {
      Configuration.commercial.jobsUrl map { url =>
        new SingleFeedFetcher(wsClient)(JobsFeedMetaData(url))
      }
  }

  private val bestsellers: Option[FeedFetcher] = {
    Configuration.commercial.magento.domain map { domain =>
      new SingleFeedFetcher(wsClient)(BestsellersFeedMetaData(domain))
    }
  }

  private val masterclasses: Option[FeedFetcher] =
    Configuration.commercial.masterclassesToken map (token =>
      new EventbriteMultiPageFeedFetcher(wsClient)(EventsFeedMetaData("masterclasses", token))
      )

  private val liveEvents: Option[FeedFetcher] =
    Configuration.commercial.liveEventsToken map (token =>
      new EventbriteMultiPageFeedFetcher(wsClient)(EventsFeedMetaData("live-events", token))
      )

  private val travelOffers: Option[FeedFetcher] =
    Configuration.commercial.travelFeedUrl map { url =>
      new SingleFeedFetcher(wsClient)(TravelOffersFeedMetaData(url))
    }

  val all: Seq[FeedFetcher] = Seq(bestsellers, masterclasses, travelOffers, jobs, liveEvents).flatten

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
