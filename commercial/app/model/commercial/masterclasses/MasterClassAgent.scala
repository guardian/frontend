package model.commercial.masterclasses

import common.{AkkaAgent, ExecutionContexts, Logging}
import model.commercial.{AdAgent, Lookup, Segment}

import scala.concurrent.Future
import scala.concurrent.duration._

object MasterClassAgent extends AdAgent[MasterClass] with ExecutionContexts {

  override def defaultAds = currentAds take 4

  override def adsTargetedAt(segment: Segment) = {
    val targetedAds = currentAds filter (_.isTargetedAt(segment))
    val adsToShow = (targetedAds ++ defaultAds) take 4
    adsToShow sortBy(_.eventBriteEvent.startDate.getMillis)
  }

  def specificClasses(eventBriteIds: Seq[String]): Seq[MasterClass] = {
    for {
      masterclass <- currentAds
      eventId <- eventBriteIds
      if masterclass.eventBriteEvent.id == eventId
    } yield {
      masterclass
    }
  }

  def wrapEventbriteWithContentApi(eventbriteEvents: Seq[EventbriteMasterClass]): Future[Seq[MasterClass]] = {

    val futureMasterclasses = eventbriteEvents map { event =>
      val contentId = event.guardianUrl.replace("http://www.theguardian.com/", "")
      Lookup.mainPicture(contentId) map { imageContainer =>
        MasterClass(event, imageContainer)
      } recover {
        // This is just in case the Future doesn't pan out.
        case _: Exception => MasterClass(event, None)
      }
    }

    Future.sequence(futureMasterclasses)
  }

  def refresh() {

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
        event.copy(keywordIds = eventKeywordIds)
      }

      val unpopulated = populated.filter(_.keywordIds.isEmpty)
      if (unpopulated.nonEmpty) {
        val unpopulatedString = unpopulated.map { event =>
          event.name + ": tags(" + event.tags.mkString(", ") + ")"
        }.mkString("; ")
        log.info(s"No keywords for these master classes: $unpopulatedString")
      }

      populated
    }

    for {
      eventBrite <- EventbriteApi.loadAds()
      masterclasses <- wrapEventbriteWithContentApi(populateKeywordIds(eventBrite.filter(_.isOpen)))
    } {
      updateCurrentAds(masterclasses)
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
      val currentAds = MasterClassAgent.currentAds
      if (currentAds.isEmpty) {
        defaultTags
      } else {
        // use event title instead of tags because it's more informative
        currentAds.map(_.eventBriteEvent.name).distinct
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
