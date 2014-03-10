package services

import common.Edition
import model.{Trail, Content}
import scala.concurrent.Future
import conf.ContentApiDoNotUseForNewQueries

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

}