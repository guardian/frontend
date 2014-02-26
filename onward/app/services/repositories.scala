package services

import common.Edition
import model.{Tag, Trail, Content}
import scala.concurrent.Future
import conf.{ContentApiDoNotUseForNewQueries, SwitchingContentApi}
import feed.MostReadAgent
import org.joda.time.DateTime

trait Related extends ConciergeRepository {
  def related(edition: Edition, path: String): Future[Seq[Trail]] = {

    //TODO sticking with old content api for performance reasons
    val response = ContentApiDoNotUseForNewQueries.item(path, edition)
      .showRelated(true)
      .response

    val trails = response.map { response =>
      response.relatedContent map { Content(_) }
    }

    trails recoverApi404With Nil
  }

  def getPopularInTag(edition: Edition, tag: String): Future[Seq[Trail]] = {

    val response = SwitchingContentApi().search(edition)
      .tag(tag)
      .pageSize(50)
      .dateId("date/last7days")
      .response

    val trails: Future[Seq[Content]] = response.map { response =>
      val trails = response.results.map(Content(_))

      val sevenDaysAgo = DateTime.now().minusDays(7)
      val twoDaysAgo = DateTime.now().minusDays(2)

      val popularInLast7Days = trails.filter(_.webPublicationDate.isAfter(sevenDaysAgo))
	.sortBy(content => - MostReadAgent.getViewCount(content.id).getOrElse(0)).take(5)

      val popularInLast2Days = trails.diff(popularInLast7Days).filter(_.webPublicationDate.isAfter(twoDaysAgo))
	.sortBy(content => - MostReadAgent.getViewCount(content.id).getOrElse(0)).take(5)

      (popularInLast2Days zip popularInLast7Days).flatten
    }

    trails
  }

}