package services

import common.Edition
import model.{Trail, Content}
import scala.concurrent.Future
import conf.{InlineRelatedContentSwitch, LiveContentApi}
import feed.MostReadAgent
import conf.Switches.RelatedContentSwitch

trait Related extends ConciergeRepository {
  def related(edition: Edition, path: String, excludeTags: Seq[String] = Nil): Future[Seq[Content]] = {

    if (RelatedContentSwitch.isSwitchedOff) {
      Future.successful(Nil)
    } else {

      // doesn't line tags being an empty string - need to explicitly pass a None
      val tags: Option[String] = excludeTags match {
        case Nil => None
        case excluding => Some(excluding.map(t => s"-$t").mkString(","))
      }

      val response = LiveContentApi.item(path, edition)
        .tag(tags)
        .showRelated(true)
        .response

      val trails = response.map { response =>
        response.relatedContent map {
          Content(_)
        }
      }

      trails recoverApi404With Nil
    }
  }

  def getPopularInTag(edition: Edition, tag: String, excludeTags: Seq[String] = Nil): Future[Seq[Content]] = {

    val tags = (tag +: excludeTags.map(t => s"-$t")).mkString(",")

    val response = LiveContentApi.search(edition)
      .tag(tags)
      .pageSize(50)
      .response

    val trails: Future[Seq[Content]] = response.map { response =>
      response.results.map(Content(_)).sortBy(content => - MostReadAgent.getViewCount(content.id).getOrElse(0)).take(10)
    }

    trails
  }

}
