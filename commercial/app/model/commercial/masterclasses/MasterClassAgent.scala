package model.commercial.masterclasses

import common.{AkkaAgent, ExecutionContexts, Logging}
import model.ImageElement
import model.commercial.{Segment, AdAgent, Lookup}
import scala.concurrent.Future
import scala.concurrent.duration._

object MasterClassAgent extends AdAgent[MasterClass] with ExecutionContexts {

  override def defaultAds = currentAds take 4

  override def adsTargetedAt(segment: Segment) = {
    val targetedAds = currentAds filter (_.isTargetedAt(segment))
    val adsToShow = (targetedAds ++ defaultAds) take 4
    adsToShow sortBy(_.eventBriteEvent.startDate.getMillis)
  }

  def wrapEventbriteWithContentApi(eventbriteEvents: Seq[EventbriteMasterClass]): Future[Seq[MasterClass]] = {
    val seqThumbs: Seq[Future[MasterClass]] = eventbriteEvents.map {
      event =>
        val contentId: String = event.guardianUrl.replace("http://www.theguardian.com/", "")
        val thumbnail: Future[Option[ImageElement]] = Lookup.thumbnail(contentId)

        thumbnail.map {
          thumb => MasterClass(event, thumb)
        } recover {
          // This is just in case the Future doesn't pan out.
          case _: Exception => MasterClass(event, None)
        }
    }
    Future.sequence(seqThumbs)
  }

  def refresh() {

    def populateKeywordIds(events: Seq[EventbriteMasterClass]):Seq[EventbriteMasterClass] = {
      val populated = events map { event =>
        val eventKeywordIds = MasterClassTagsAgent.forTag(event.name)
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
          tagKeywordIds.alter(_.updated(tag, keywords.map(_.id)))(2.seconds)
        }
      }
    }
  }

  def stop() {
    tagKeywordIds.close()
  }

  def forTag(name: String) = tagKeywordIds().get(name).getOrElse(Nil)
}
