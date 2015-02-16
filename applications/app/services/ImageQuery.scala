package services

import com.gu.contentapi.client.model.ItemResponse
import common.Edition
import model.ApiContent2Is
import common._
import conf.LiveContentApi
import controllers.ImageContentPage
import model.{RelatedContent, Trail, Content, ImageContent}
import play.api.mvc.{Result => PlayResult}
import LiveContentApi.getResponse

import scala.concurrent.Future

trait ImageQuery extends ConciergeRepository {
  def image(edition: Edition, path: String): Future[Either[ImageContentPage, PlayResult]] = {
    log.info(s"Fetching image content: $path for edition ${edition.id}")
    val response = getResponse(LiveContentApi.item(path, edition)
      .showFields("all")
    ) map { response: ItemResponse =>
        val mainContent = response.content.filter(_.isImageContent).map(Content(_))
        mainContent.map { case content: ImageContent =>
          Left(ImageContentPage(content, RelatedContent(content, response)))
        }.getOrElse(Right(NotFound))
      }

    response recover convertApiExceptions
  }
}
