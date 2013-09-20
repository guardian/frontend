package services

import common.{ExecutionContexts, Logging, Edition}
import conf.SwitchingContentApi
import model.{Trail, Content, SupportedContentFilter}
import com.gu.openplatform.contentapi.ApiError
import scala.concurrent.Future

trait Concierge extends ExecutionContexts with Logging {
  implicit class future2RecoverApi404With[T](response: Future[T]) {
    def recoverApi404With(t: T) = response.recover {
      case ApiError(404, message) =>
        log.info(s"Got a 404 while calling content api: $message")
        t
    }
  }
}

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