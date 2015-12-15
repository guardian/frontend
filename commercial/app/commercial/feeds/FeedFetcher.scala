package commercial.feeds

import java.lang.System.currentTimeMillis

import com.ning.http.client.Response
import conf.Configuration
import conf.switches.{Switch, Switches}
import model.commercial.soulmates.SoulmatesAgent
import org.joda.time.{DateTime, DateTimeZone}
import play.api.Play.current
import play.api.libs.json.{JsArray, Json}
import play.api.libs.ws.{WS, WSResponse}

import scala.concurrent.duration.{Duration, _}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

trait FeedFetcher {

  def feedName: String
  def url: String

  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse]
}

class SingleFeedFetcher(
  val feedName: String,
  val url: String,
  val parameters: Map[String, String],
  val timeout: Duration,
  val switch: Switch,
  responseEncoding: String = ResponseEncoding.default
) extends FeedFetcher {

  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse] = {
    switch.isGuaranteedSwitchedOn flatMap { reallyOn =>
      if (reallyOn) {
        FeedFetcher.fetch(url, parameters, timeout, responseEncoding)
      } else Future.failed(SwitchOffException(switch.name))
    }
  }
}

class EventbriteMultiPageFeedFetcher(accessToken: String) extends FeedFetcher {

  val feedName = "masterclasses"
  val url = "https://www.eventbriteapi.com/v3/users/me/owned_events/"

  private val baseParameters = Map(
    "token" -> accessToken,
    "status" -> "live",
    "expand" -> "ticket_classes,venue"
  )
  private val timeout = 20.seconds
  private val switch = Switches.MasterclassFeedSwitch

  def fetchPage(index: Int)(implicit executionContext: ExecutionContext): Future[FetchResponse] = {
    FeedFetcher.fetch(url, baseParameters + ("page" -> index.toString), timeout, ResponseEncoding.utf8)
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

    switch.isGuaranteedSwitchedOn flatMap { reallyOn =>
      if (reallyOn) {
        fetch(None, None, 0)
      } else Future.failed(SwitchOffException(switch.name))
    }
  }
}

object FeedFetcher {

  def fetch(url: String, parameters: Map[String, String], timeout: Duration, responseEncoding: String)
    (implicit executionContext: ExecutionContext): Future[FetchResponse] = {

    def body(response: WSResponse): String = {
      if (responseEncoding == ResponseEncoding.default) {
        response.body
      } else {
        response.underlying[Response].getResponseBody(responseEncoding)
      }
    }

    def contentType(response: WSResponse): String = {
      response.underlying[Response].getContentType
    }

    val start = currentTimeMillis()

    val futureResponse = WS.url(url)
                         .withQueryString(parameters.toSeq: _*)
                         .withRequestTimeout(timeout.toMillis.toInt)
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

    // url changes daily so cannot be val
    def url = {

      /*
       * Using offset time because this appears to be how the URL is constructed.
       * With UTC time we lose the feed for 2 hours at midnight every day.
       */
      val feedDate = new DateTime(DateTimeZone.forOffsetHours(-2)).toString("yyyy-MM-dd")

      val urlTemplate = Configuration.commercial.jobsUrlTemplate
      urlTemplate map (_ replace("yyyy-MM-dd", feedDate))
    }

    url map {
      new SingleFeedFetcher("jobs", _, Map.empty, 2.seconds, Switches.JobFeedSwitch, ResponseEncoding.utf8)
    }
  }

  private val soulmates: Seq[FeedFetcher] = {

    def feedFetcher(agent: SoulmatesAgent): Option[FeedFetcher] = {
      Configuration.commercial.soulmatesApiUrl map { url =>
        new SingleFeedFetcher(
          s"soulmates/${agent.groupName}",
          s"$url/${agent.feed.path}",
          Map.empty,
          2.seconds,
          Switches.SoulmatesFeedSwitch,
          ResponseEncoding.utf8
        )
      }
    }

    SoulmatesAgent.agents flatMap feedFetcher
  }

  private val bestsellers: Option[FeedFetcher] = {
    Configuration.commercial.magento.domain map {
      domain => s"http://$domain/bertrams/feed/independentsTop20"
    } map {
      new SingleFeedFetcher(
        "general-bestsellers",
        _,
        Map.empty,
        2.seconds,
        Switches.GuBookshopFeedsSwitch,
        ResponseEncoding.utf8
      )
    }
  }

  private val masterclasses: Option[FeedFetcher] =
    Configuration.commercial.masterclassesToken map (new EventbriteMultiPageFeedFetcher(_))

  val all: Seq[FeedFetcher] = soulmates ++ Seq(jobs, bestsellers, masterclasses).flatten
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
