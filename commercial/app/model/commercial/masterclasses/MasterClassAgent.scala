package model.commercial.masterclasses

import common.{AkkaAgent, ExecutionContexts, Logging}
import model.commercial._

import scala.concurrent.Future

object MasterClassAgent extends MerchandiseAgent[MasterClass] with ExecutionContexts with Logging {

  def masterclassesTargetedAt(segment: Segment) = {

    def startDateSort: (MasterClass) => Long = _.eventBriteEvent.startDate.getMillis

    lazy val defaultClasses = available.sortBy(startDateSort) take 4
    val targeted = available filter { masterclass =>
      Keyword.idSuffixesIntersect(segment.context.keywords,
        masterclass.eventBriteEvent.keywordIdSuffixes)
    }
    val toShow = (targeted.sortBy(startDateSort) ++ defaultClasses) take 4
    toShow sortBy startDateSort
  }

  def specificClasses(eventBriteIds: Seq[String]): Seq[MasterClass] = {
    for {
      masterclass <- available
      eventId <- eventBriteIds
      if masterclass.eventBriteEvent.id == eventId
    } yield {
      masterclass
    }
  }

  def wrapEventbriteWithContentApi(eventbriteEvents: Seq[EventbriteMasterClass]): Future[Seq[MasterClass]] = {

    val futureMasterclasses = eventbriteEvents map { event =>
      val contentId = event.guardianUrl
        .replace("http://www.theguardian.com/", "")
        .replaceFirst("\\?.*", "")
      Lookup.mainPicture(contentId) map { imageContainer =>
        MasterClass(event, imageContainer)
      } recover {
        // This is just in case the Future doesn't pan out.
        case _: Exception => MasterClass(event, None)
      }
    }

    Future.sequence(futureMasterclasses)
  }

  def refresh(): Unit = {

    def populateKeywordIds(events: Seq[EventbriteMasterClass]):Seq[EventbriteMasterClass] = {
      val populated = events map { event =>

        val keywordIdsFromTitle = MasterClassTagsAgent.forTag(event.name)

        val keywordIdsFromTags = (event.tags flatMap MasterClassTagsAgent.forTag).distinct

        val eventKeywordIds = {
          if (keywordIdsFromTitle.nonEmpty) {
            keywordIdsFromTitle
          } else {
            keywordIdsFromTags
          }
        }
        event.copy(keywordIdSuffixes = eventKeywordIds map Keyword.getIdSuffix)
      }

      val unpopulated = populated.filter(_.keywordIdSuffixes.isEmpty)
      if (unpopulated.nonEmpty) {
        val unpopulatedString = unpopulated.map { event =>
          event.name + ": tags(" + event.tags.mkString(", ") + ")"
        }.mkString("; ")
        log.info(s"No keywords for these master classes: $unpopulatedString")
      }

      populated
    }

    def updateCurrentMasterclasses(freshData: Seq[MasterClass]): Unit = {
      updateAvailableMerchandise(freshData)
    }

    for {
      eventBrite <- EventbriteApi.loadEvents()
      masterclasses <- wrapEventbriteWithContentApi(populateKeywordIds(eventBrite.filter(_.isOpen)))
    } {
      updateCurrentMasterclasses(masterclasses)
    }
  }
}


object MasterClassTagsAgent extends ExecutionContexts with Logging {

  private lazy val tagKeywordIds = AkkaAgent(Map.empty[String, Seq[String]])

  private val defaultTags = Seq(
    "creative writing",
    "journalism",
    "photography",
    "travel"
  )

  def refresh(): Future[Seq[Future[Map[String, Seq[String]]]]] = {
    val tags = {
      val current = MasterClassAgent.available
      if (current.isEmpty) {
        defaultTags
      } else {
        // use event title instead of tags because it's more informative
        current.map(_.eventBriteEvent.name).distinct
      }
    }
    Future.sequence {
      tags map { tag =>
        Lookup.keyword(tag) map { keywords =>
          tagKeywordIds.alter(_.updated(tag, keywords.map(_.id)))
        }
      }
    }
  }

  def forTag(name: String) = tagKeywordIds().getOrElse(name, Nil)
}
