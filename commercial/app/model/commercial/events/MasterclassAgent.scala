package model.commercial.events

import commercial.feeds.{FeedMetaData, ParsedFeed}
import common.{ExecutionContexts, Logging}
import model.commercial._

import scala.concurrent.Future

object MasterclassAgent extends MerchandiseAgent[Masterclass] with ExecutionContexts with Logging {

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

    val futureParsedFeed = Eventbrite.parsePagesOfEvents(feedMetaData, feedContent)
    futureParsedFeed flatMap { feed =>

      val masterclasses: Seq[Masterclass] = feed.contents flatMap { event => Masterclass(event) }
      updateAvailableMerchandise(masterclasses)

      val masterclassesWithImages = addImagesFromContentApi(populateKeywordIds(masterclasses.filter(_.isOpen)))
      masterclassesWithImages map { updates =>
        updateAvailableMerchandise(updates)
        ParsedFeed(updates, feed.parseDuration)
      }
    }
  }

  def availableMasterclasses: Seq[Masterclass] = available

  def masterclassesTargetedAt(segment: Segment) = {

    val keywords: Seq[String] = segment.context.keywords

    def startDateSort(masterclass: Masterclass): Long = masterclass.startDate.getMillis

    def subList(masterclasses: Seq[Masterclass]): Seq[Masterclass] = masterclasses take 4

    lazy val defaultClasses = subList(available.sortBy(startDateSort))
    val targeted = available filter { masterclass =>
      Keyword.idSuffixesIntersect(keywords, masterclass.keywordIdSuffixes)
    }

    val toShow = subList(targeted.sortBy(startDateSort) ++ defaultClasses)
    toShow sortBy startDateSort
  }

  def specificMasterclasses(eventBriteIds: Seq[String]): Seq[Masterclass] = {
    for {
      masterclass <- available
      eventId <- eventBriteIds
      if masterclass.id == eventId
    } yield {
      masterclass
    }
  }
}
