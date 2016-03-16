package model.commercial.events

import java.lang.System._

import commercial.feeds._
import conf.Configuration
import common.{ExecutionContexts, Logging}
import model.commercial._
import play.api.Play.current
import play.api.libs.json.Json
import play.api.libs.ws.WS

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

object LiveEventAgent extends MerchandiseAgent[LiveEvent] with ExecutionContexts with Logging {

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[LiveEvent]] = {

    def fetchAndParseLiveEventImages() = {

      def parseEventImages(feed: String): Seq[LiveEventImage] = {
        val json = Json.parse(feed)
        val eventImages = (json \ "events").as[Seq[LiveEventImage]]
        eventImages
      }

      val futureResponse = WS.url(Configuration.commercial.liveEventsImagesUrl)
        .withRequestTimeout(feedMetaData.timeout.toMillis.toInt)
        .get()

      futureResponse map { response =>
        if (response.status == 200) {
          parseEventImages(response.body)
        } else {
          throw FetchException(response.status, response.statusText)
        }
      } recoverWith {
        case NonFatal(e) => Future.failed(e)
      }
    }
    val start = currentTimeMillis()
    val futureEventImages = fetchAndParseLiveEventImages
    val futureParsedFeed = Eventbrite.parsePagesOfEvents(feedMetaData, feedContent)

    val futureLiveEvents =
      for{
        ParsedFeed(events, _) <- futureParsedFeed
        eventImages <- futureEventImages
      } yield events map { event => LiveEvent(event, eventImages.find(_.id == event.id)) }

    futureLiveEvents map { liveEvents =>
      updateAvailableMerchandise(liveEvents)
      ParsedFeed(liveEvents, Duration(currentTimeMillis- start, MILLISECONDS))
    }
  }

  def availableLiveEvents: Seq[LiveEvent] = available

  def specificLiveEvents(eventBriteIds: Seq[String]): Seq[LiveEvent] = {
    for {
      liveEvent <- available
      eventId <- eventBriteIds
      if liveEvent.id == eventId
    } yield liveEvent
  }
}
