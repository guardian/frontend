package model.commercial.events

import commercial.feeds.{FeedMetaData, ParsedFeed}
import common.{ExecutionContexts, Logging}
import contentapi.ContentApiClient
import model.commercial._

import scala.concurrent.Future

class MasterclassAgent(contentApiClient: ContentApiClient) extends MerchandiseAgent[Masterclass] with ExecutionContexts with Logging {

  private val lookup = new Lookup(contentApiClient)

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[Masterclass]] = {

    def fetchKeywords(name: String): Future[Seq[String]] = for(tags <- lookup.keyword(name)) yield tags.map(_.id)

    def addKeywordsFromContentApi(masterclasses: Seq[Masterclass]): Future[Seq[Masterclass]] = {
      Future.traverse(masterclasses) { masterclass =>
        fetchKeywords(masterclass.name).map { keywords =>
          masterclass.copy(keywordIdSuffixes = keywords map Keyword.getIdSuffix)
        }
      }
    }

    def addImagesFromContentApi(masterclasses: Seq[Masterclass]): Future[Seq[Masterclass]] = {

      val futureMasterclasses = masterclasses map { masterclass =>
        val contentId = masterclass.guardianUrl
          .replace("http://www.theguardian.com/", "")
          .replaceFirst("\\?.*", "")
        lookup.mainPicture(contentId) map { imageContainer =>
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

      val masterclasses: Seq[Masterclass] = feed.contents flatMap { event => Masterclass.fromEvent(event) }
      updateAvailableMerchandise(masterclasses)

      for {
        withKeywords <- addKeywordsFromContentApi(masterclasses.filter(_.isOpen))
        withKeywordsAndImages <- addImagesFromContentApi(withKeywords)
      } yield {
        updateAvailableMerchandise(withKeywordsAndImages)
        ParsedFeed(withKeywordsAndImages, feed.parseDuration)
      }
    }
  }

  def availableMasterclasses: Seq[Masterclass] = available

  def masterclassesTargetedAt(segment: Segment): Seq[Masterclass] = {

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
