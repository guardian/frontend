package services

import common.Edition
import model.{Tag, Trail, Content}
import scala.concurrent.Future
import conf.{ContentApiDoNotUseForNewQueries, SwitchingContentApi}
import feed.MostReadAgent
import org.joda.time.DateTime
import scala.collection.mutable.ListBuffer

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

      val orderedTrails = trails.sortBy(content => - MostReadAgent.getViewCount(content.id).getOrElse(0))

      val lb = ListBuffer[Content]()
      for (a <- 0 until 15) {
        val fromDate = DateTime.now().minusDays( if (a % 2 == 0) 2 else 7 ) // alernate content <2 and <7 days old
        orderedTrails.find(c => c.webPublicationDate.isAfter(fromDate) && lb.indexOf(c) == -1).map(lb += _)
      }
      lb.result()
    }

    trails
  }

}