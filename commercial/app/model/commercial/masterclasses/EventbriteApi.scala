package model.commercial.masterclasses

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.switches.Switches.MasterclassFeedSwitch
import model.commercial.{FeedMissingConfigurationException, FeedReader, FeedRequest}
import org.joda.time.DateTime.now
import play.api.libs.json.{JsArray, JsValue, Json}

import scala.concurrent.Future
import scala.concurrent.duration._

object EventbriteApi extends ExecutionContexts with Logging {

  private val feedName = "Masterclasses"
  private val url: String = "https://www.eventbriteapi.com/v3/users/me/owned_events/"

  private lazy val maybeParameters: Option[Map[String, String]] = {
    for (token <- CommercialConfiguration.masterclassesToken) yield {
      Map(
        "token" -> token,
        "status" -> "live",
        "expand" -> "ticket_classes,venue"
      )
    }
  }

  def extractEventsFromFeed(jsValue: JsValue): Seq[JsValue] = {
    val maybeEvents = for (JsArray(events) <- (jsValue \ "events").toOption) yield events
    maybeEvents getOrElse Nil
  }

  def loadEvents(): Future[Seq[EventbriteMasterClass]] = {

    val eventualFirstPageResult = loadPageOfEvents(1)

    val events = for (firstPageResult <- eventualFirstPageResult) yield {
      val pageCount = firstPageResult.pageCount
      val eventualEventsFromOtherPages = if (pageCount > 1) {
        val events = for (i <- 2 to pageCount) yield {
          for (pageResult <- loadPageOfEvents(i)) yield pageResult.events
        }
        Future.sequence(events) map (_.flatten)
      } else {
        Future.successful(Nil)
      }
      for (eventsFromOtherPages <- eventualEventsFromOtherPages) yield {
        firstPageResult.events ++ eventsFromOtherPages
      }
    }

    val eventualEvents = events flatMap identity

    eventualEvents onSuccess {
      case results => log.info(s"Loaded ${results.size} $feedName from $url")
    }

    eventualEvents
  }

  def loadPageOfEvents(pageIndex: Int): Future[PageResult] = {
    val pageResult = maybeParameters map { parameters =>
      val request = FeedRequest(
        feedName,
        switch = MasterclassFeedSwitch,
        url,
        parameters + ("page" -> pageIndex.toString),
        timeout = 60.seconds,
        responseEncoding = Some("utf-8"))
      FeedReader.read(request) { content =>
        val json = Json.parse(content)
        val pageCount = (json \ "pagination" \ "page_count").as[Int]
        val masterclasses = for {
          jsValue <- extractEventsFromFeed(json)
          masterclass <- EventbriteMasterClass(jsValue)
          if masterclass.startDate.isAfter(now.plusWeeks(2))
        } yield masterclass
        PageResult(masterclasses, pageCount)
      }
    } getOrElse {
      log.warn(s"Missing URL for $feedName feed")
      Future.failed(FeedMissingConfigurationException(feedName))
    }

    pageResult onSuccess {
      case result => log.info(s"Loaded page $pageIndex of ${result.pageCount} masterclass pages")
    }

    pageResult
  }
}

case class PageResult(events: Seq[EventbriteMasterClass], pageCount: Int)
