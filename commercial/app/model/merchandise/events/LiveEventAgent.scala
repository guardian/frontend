package commercial.model.merchandise.events

import java.lang.System._

import commercial.model.feeds._
import common.{Box, GuLogging}
import conf.Configuration
import commercial.model.merchandise.LiveEvent
import play.api.libs.json.JsValue
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.control.NonFatal

class LiveEventAgent(wsClient: WSClient) extends GuLogging {

  private lazy val liveEventAgent = Box[Seq[LiveEvent]](Seq.empty)

  def specificLiveEvent(eventBriteId: String): Option[LiveEvent] = liveEventAgent.get().find(_.eventId == eventBriteId)

  private def updateAvailableMerchandise(
      freshMerchandise: Seq[LiveEvent],
  )(implicit executionContext: ExecutionContext): Future[Seq[LiveEvent]] = {
    liveEventAgent.alter { oldMerchandise =>
      if (freshMerchandise.nonEmpty) {
        freshMerchandise
      } else {
        log.warn("Using old merchandise as there is no fresh merchandise")
        oldMerchandise
      }
    }
  }

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String])(implicit
      executionContext: ExecutionContext,
  ): Future[ParsedFeed[LiveEvent]] = {

    def fetchAndParseLiveEventsMembershipInfo: Future[Seq[LiveEventMembershipInfo]] = {

      def requestLiveEventsMembershipInfo: Future[WSResponse] =
        wsClient
          .url(Configuration.commercial.liveEventsMembershipUrl)
          .withRequestTimeout(feedMetaData.timeout)
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
      for {
        eventMembershipInfo <- fetchAndParseLiveEventsMembershipInfo
        ParsedFeed(events, _) <- Eventbrite.parsePagesOfEvents(feedMetaData, feedContent)
      } yield events flatMap { event =>
        val matchingMembershipInfo = eventMembershipInfo find (_.id == event.id)
        matchingMembershipInfo map (LiveEvent.fromEvent(event, _))
      }

    liveEvents map updateAvailableMerchandise
    liveEvents map { ParsedFeed(_, Duration(currentTimeMillis - start, MILLISECONDS)) }
  }
}
