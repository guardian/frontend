package services

import com.gu.contentapi.client.model.ItemResponse
import common.{Edition, _}
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import controllers.ImageContentPage
import model.{ApiContent2Is, Content, ImageContent, RelatedContent}
import play.api.mvc.{RequestHeader, Result => PlayResult}

import scala.concurrent.Future

trait ImageQuery extends ConciergeRepository {
  def image(edition: Edition, path: String)(implicit request: RequestHeader): Future[Either[ImageContentPage, PlayResult]] = {
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
