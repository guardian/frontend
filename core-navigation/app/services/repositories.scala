package services

import common.Edition
import conf.ContentApi
import model.{Trail, Content}
import scala.concurrent.Future

trait Related extends ConciergeRepository {
  def related(edition: Edition, path: String): Future[Seq[Trail]] = {
    val response = ContentApi.item(path, edition)
      .tag(None)
      .showFields("all")
      .showRelated(true)
      .response

    val trails = response.map { response =>
      response.relatedContent map { Content(_) }
    }

    trails recoverApi404With Nil
  }
}