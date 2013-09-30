package services

import common.Edition
import conf.SwitchingContentApi
import model.{Trail, Content, SupportedContentFilter}
import scala.concurrent.Future

trait Related extends Concierge {
  def related(edition: Edition, path: String): Future[Seq[Trail]] = {
    val response = SwitchingContentApi().item(path, edition)
      .tag(None)
      .showFields("all")
      .showRelated(true)
      .response

    val trails = response.map { response =>
      val content = response.relatedContent map { Content(_) }
      SupportedContentFilter(content)
    }

    trails recoverApi404With Nil
  }
}

object Concierge extends Related