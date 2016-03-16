package model.commercial.events

import commercial.feeds.{FeedMetaData, ParsedFeed}
import common.{ExecutionContexts, Logging}
import model.commercial._

import scala.concurrent.Future

object LiveEventAgent extends MerchandiseAgent[LiveEvent] with ExecutionContexts with Logging {

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[LiveEvent]] = {

    def populateImageUrl(liveEvents: Seq[LiveEvent]): Seq[LiveEvent] = {

      liveEvents map { liveEvent =>
        val imageUrl: String = "http://imgur.com/6TdVnz2" //MasterclassTagsAgent.forTag(liveEvent.name)
        liveEvent.copy(imageUrl = Some(imageUrl))
      }
    }

    val futureParsedFeed = Eventbrite.parsePagesOfEvents(feedMetaData, feedContent)
    futureParsedFeed map { feed =>

      val liveEvents: Seq[LiveEvent] = feed.contents map { event => LiveEvent(event) }
      updateAvailableMerchandise(liveEvents)

      val liveEventsWithImages = populateImageUrl(liveEvents.filter(_.isOpen))
      updateAvailableMerchandise(liveEventsWithImages)
      ParsedFeed(liveEventsWithImages, feed.parseDuration)
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
