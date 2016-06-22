package model.commercial.events

import java.lang.System._

import commercial.feeds._
import common.{AkkaAgent, ExecutionContexts, Logging}
import conf.Configuration
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

  def specificLiveEvent(eventBriteId: String): Option[LiveEvent] = availableLiveEvents find (_.eventId == eventBriteId)

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

    def fetchAndParseLiveEventsMembershipInfo: Future[Seq[LiveEventMembershipInfo]] = {

      def requestLiveEventsMembershipInfo: Future[WSResponse] =
        WS.url(Configuration.commercial.liveEventsMembershipUrl)
          .withRequestTimeout(feedMetaData.timeout.toMillis.toInt)
          .get()

      def parseLiveEventsMembershipInfo(feed: String): Seq[LiveEventMembershipInfo] = {
        val json = Json.parse(feed)
        (json \ "events").as[Seq[LiveEventMembershipInfo]]
      }

      requestLiveEventsMembershipInfo map { response =>
        if (response.status == 200)
          parseLiveEventsMembershipInfo(response.body)
        else
          throw FetchException(response.status, response.statusText)
      } recoverWith {
        case NonFatal(e) => Future.failed(e)
      }
    }

    val start = currentTimeMillis()

    val liveEvents =
      for{
        eventMembershipInfo <- fetchAndParseLiveEventsMembershipInfo
        ParsedFeed(events, _) <- Eventbrite.parsePagesOfEvents(feedMetaData, feedContent)
      } yield events.map ( event =>
        LiveEvent(event, eventMembershipInfo find (_.id == event.id))
      )

    liveEvents map updateAvailableMerchandise
    liveEvents map { ParsedFeed(_, Duration(currentTimeMillis- start, MILLISECONDS)) }
  }
}
