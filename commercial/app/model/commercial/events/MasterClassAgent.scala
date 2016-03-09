package model.commercial.events

import commercial.feeds.{FeedMetaData, ParsedFeed}
import common.{AkkaAgent, ExecutionContexts, Logging}
import model.commercial._

import scala.concurrent.Future

object MasterclassAgent extends ExecutionContexts with Logging {

  private lazy val masterclassAgent = AkkaAgent[Seq[Masterclass]](Nil)

  def availableMasterclasses: Seq[Masterclass] = masterclassAgent.get

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[Masterclass]] = {

    def populateKeywordIds(masterclasses: Seq[Masterclass]): Seq[Masterclass] = {

      masterclasses map { masterclass =>
        val keywordIdsFromTitle = MasterclassTagsAgent.forTag(masterclass.name)
        masterclass.copy(keywordIdSuffixes = keywordIdsFromTitle map Keyword.getIdSuffix)
      }
    }

    def addImagesFromContentApi(masterclasses: Seq[Masterclass]): Future[Seq[Masterclass]] = {

      val futureMasterclasses = masterclasses map { masterclass =>
        val contentId = masterclass.guardianUrl
          .replace("http://www.theguardian.com/", "")
          .replaceFirst("\\?.*", "")
        Lookup.mainPicture(contentId) map { imageContainer =>
          masterclass.copy(mainPicture = imageContainer)
        } recover {
          // This is just in case the Future doesn't pan out.
          case _: Exception => masterclass
        }
      }

      Future.sequence(futureMasterclasses)
    }

    def updateAvailableMasterclasses(masterclasses: Seq[Masterclass]): Future[Seq[Masterclass]] = {
      masterclassAgent.alter { oldMasterclasses =>
        if (masterclasses.nonEmpty) {
          masterclasses
        } else {
          log.warn("Using old merchandise as there is no fresh merchandise")
          oldMasterclasses
        }
      }
    }

    val futureParsedFeed = EventbriteApi.parseEvents(feedMetaData, feedContent)
    futureParsedFeed map { feed =>

      val masterclasses: Seq[Masterclass] = feed.contents map { event => Masterclass(event) }
      updateAvailableMasterclasses(masterclasses)
    }

    val masterclassesWithImagesAndTags = addImagesFromContentApi(populateKeywordIds(availableMasterclasses.filter(_.isOpen)))
    masterclassesWithImagesAndTags map { updateAvailableMasterclasses(_) }

    for {
      feed <- futureParsedFeed
      masterclasses <- masterclassesWithImagesAndTags
    } yield ParsedFeed(masterclasses, feed.parseDuration)
  }

  def masterclassesTargetedAt(segment: Segment) = {

    val keywords: Seq[String] = segment.context.keywords

    def startDateSort(masterclass: Masterclass): Long = masterclass.startDate.getMillis

    def subList(masterclasses: Seq[Masterclass]): Seq[Masterclass] = masterclasses take 4

    lazy val defaultClasses = subList(availableMasterclasses.sortBy(startDateSort))
    val targeted = availableMasterclasses filter { masterclass =>
      Keyword.idSuffixesIntersect(keywords, masterclass.keywordIdSuffixes)
    }

    val toShow = subList(targeted.sortBy(startDateSort) ++ defaultClasses)
    toShow sortBy startDateSort
  }

  def specificMasterclasses(eventBriteIds: Seq[String]): Seq[Masterclass] = {
    for {
      masterclass <- availableMasterclasses
      eventId <- eventBriteIds
      if masterclass.id == eventId
    } yield {
      masterclass
    }
  }
}
