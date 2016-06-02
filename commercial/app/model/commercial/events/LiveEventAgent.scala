package model.commercial.events

import java.lang.System._

import commercial.feeds._
import common.{AkkaAgent, ExecutionContexts, Logging}
import conf.Configuration
import org.joda.time.DateTime.now
import play.api.Play.current
import play.api.libs.json.Json
import play.api.libs.ws.{WS, WSResponse}

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

object LiveEventAgent extends ExecutionContexts with Logging {

  private lazy val liveEventAgent = AkkaAgent[Seq[LiveEvent]](Seq.empty)

  def availableLiveEvents: Seq[LiveEvent] = liveEventAgent.get

  def specificLiveEvents(eventIds: Seq[String]): Seq[LiveEvent] = availableLiveEvents filter (eventIds contains _.eventId)

  def specificLiveEvent(eventBriteId: String): Option[LiveEvent] = availableLiveEvents.find(_.eventId == eventBriteId)

  def updateAvailableMerchandise(freshMerchandise: Seq[LiveEvent]): Future[Seq[LiveEvent]] = {
    liveEventAgent.alter { oldMerchandise =>
      if (freshMerchandise.nonEmpty) {
        freshMerchandise
      } else {
        log.warn("Using old merchandise as there is no fresh merchandise")
        oldMerchandise
      }
    }
  }

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[LiveEvent]] = {

    def fetchAndParseLiveEventImages: Future[Seq[LiveEventImage]] = {

      def requestEventImages: Future[WSResponse] =
        WS.url(Configuration.commercial.liveEventsImagesUrl)
          .withRequestTimeout(feedMetaData.timeout.toMillis.toInt)
          .get()

      def parseEventImages(feed: String): Seq[LiveEventImage] = {
        val json = Json.parse(feed)
        (json \ "events").as[Seq[LiveEventImage]]
      }

      requestEventImages map { response =>
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
    val eventDateFilter = now plusWeeks 2

    val liveEvents =
      for{
        eventImages <- fetchAndParseLiveEventImages
        ParsedFeed(events, _) <- Eventbrite.parsePagesOfEvents(feedMetaData, feedContent)
      } yield events
            .filter (_.startDate isAfter eventDateFilter)
            .map ( event => LiveEvent(event, eventImages find (_.eventId == event.id)) )

    liveEvents map updateAvailableMerchandise
    liveEvents map { ParsedFeed(_, Duration(currentTimeMillis- start, MILLISECONDS)) }
  }
}
