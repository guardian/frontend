package commercial.feeds

import java.lang.System.currentTimeMillis

import com.ning.http.client.Response
import conf.Configuration
import model.commercial.soulmates.SoulmatesAgent
import play.api.Play.current
import play.api.libs.json.{JsArray, Json}
import play.api.libs.ws.{WS, WSResponse}

import scala.concurrent.duration.{Duration, _}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

trait FeedFetcher {

  def feedMetaData: FeedMetaData
  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse]
}

class SingleFeedFetcher(val feedMetaData: FeedMetaData) extends FeedFetcher {

  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse] = {
    feedMetaData.switch.isGuaranteedSwitchedOn flatMap { reallyOn =>
      if (reallyOn) {
        FeedFetcher.fetch(feedMetaData)
      } else Future.failed(SwitchOffException(feedMetaData.switch.name))
    }
  }
}

class EventbriteMultiPageFeedFetcher(accessToken: String) extends FeedFetcher {

  val feedMetaData = MasterclassesFeedMetaData(accessToken, Map.empty)

  def fetchPage(index: Int)(implicit executionContext: ExecutionContext): Future[FetchResponse] = {
    FeedFetcher.fetch(feedMetaData.copy(parameters = feedMetaData.baseParameters + ("page" -> index.toString)))
  }

  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse] = {

    def combine(prevPagesContent: String, currPageContent: String): String = {
      Json.parse(prevPagesContent).as[JsArray].append(Json.parse(currPageContent)).toString()
    }

    def fetch(
      prevPages: Option[Future[FetchResponse]],
      numPages: Option[Int],
      index: Int
    ): Future[FetchResponse] = {

      (prevPages, numPages) match {

        case (Some(soFar), Some(pageCount)) =>
          if (index > pageCount) {
            soFar
          } else {
            val combinedPages = for {
              prevPages <- soFar
              currPage <- fetchPage(index)
            } yield {
              FetchResponse(
                Feed(
                  content = combine(prevPages.feed.content, currPage.feed.content),
                  contentType = prevPages.feed.contentType
                ),
                duration = prevPages.duration + currPage.duration
              )
            }
            fetch(Some(combinedPages), numPages, index + 1)
          }

        case _ =>
          fetchPage(1) flatMap { response =>
            val json = Json.parse(response.feed.content)
            val feed = response.feed.copy(content = JsArray(Seq(json)).toString())
            fetch(
              prevPages = Some(Future.successful(response.copy(feed = feed))),
              numPages = Some((json \ "pagination" \ "page_count").as[Int]),
              index = 2
            )
          }
      }
    }

    feedMetaData.switch.isGuaranteedSwitchedOn flatMap { reallyOn =>
      if (reallyOn) {
        fetch(None, None, 0)
      } else Future.failed(SwitchOffException(feedMetaData.switch.name))
    }
  }
}

object FeedFetcher {

  def fetch(feedMetaData: FeedMetaData)(implicit executionContext: ExecutionContext): Future[FetchResponse] = {

    def body(response: WSResponse): String = {
      if (feedMetaData.responseEncoding == ResponseEncoding.default) {
        response.body
      } else {
        response.underlying[Response].getResponseBody(feedMetaData.responseEncoding)
      }
    }

    def contentType(response: WSResponse): String = {
      response.underlying[Response].getContentType
    }

    val start = currentTimeMillis()

    val futureResponse = WS.url(feedMetaData.url)
                         .withQueryString(feedMetaData.parameters.toSeq: _*)
                         .withRequestTimeout(feedMetaData.timeout.toMillis.toInt)
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

  private val jobs: Option[FeedFetcher] = {
    Configuration.commercial.jobsUrlTemplate map { template =>
      new SingleFeedFetcher(JobsFeedMetaData(template))
    }
  }

  private val soulmates: Seq[FeedFetcher] = {

    def feedFetcher(agent: SoulmatesAgent): Option[FeedFetcher] = {
      Configuration.commercial.soulmatesApiUrl map { url =>
        new SingleFeedFetcher(SoulmatesFeedMetaData(url, agent))
      }
    }

    SoulmatesAgent.agents flatMap feedFetcher
  }

  private val bestsellers: Option[FeedFetcher] = {
    Configuration.commercial.magento.domain map { domain =>
      new SingleFeedFetcher(BestsellersFeedMetaData(domain))
    }
  }

  private val masterclasses: Option[FeedFetcher] =
    Configuration.commercial.masterclassesToken map (new EventbriteMultiPageFeedFetcher(_))

  private val travelOffers: Option[FeedFetcher] =
    Configuration.commercial.traveloffers_url map { url =>
      new SingleFeedFetcher(TravelOffersFeedMetaData(url))
    }

  val all: Seq[FeedFetcher] = soulmates ++ Seq(jobs, bestsellers, masterclasses, travelOffers).flatten
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
