package model.commercial.events

import java.lang.System._

import commercial.feeds._
import common.{AkkaAgent, ExecutionContexts, Logging}
import conf.Configuration
import play.api.Play.current
import play.api.libs.json.JsValue
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

case class LiveEventAgent(wsClient: WSClient) extends ExecutionContexts with Logging {

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
        wsClient.url(Configuration.commercial.liveEventsMembershipUrl)
          .withRequestTimeout(feedMetaData.timeout.toMillis.toInt)
          .get()

      def parseLiveEventsMembershipInfo(feed: JsValue): Seq[LiveEventMembershipInfo] =
        (feed \ "events").as[Seq[LiveEventMembershipInfo]]

      requestLiveEventsMembershipInfo map { response =>
        if (response.status == 200)
          parseLiveEventsMembershipInfo(response.json)
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
      } yield events flatMap { event =>
        val matchingMembershipInfo = eventMembershipInfo find (_.id == event.id)
        matchingMembershipInfo map (LiveEvent(event, _) )
      }

    liveEvents map updateAvailableMerchandise
    liveEvents map { ParsedFeed(_, Duration(currentTimeMillis- start, MILLISECONDS)) }
  }
}
