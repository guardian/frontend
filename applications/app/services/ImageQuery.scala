package services

import com.gu.contentapi.client.model.v1.ItemResponse
import common.{Edition, _}
import contentapi.ContentApiClient
import controllers.ImageContentPage
import model.{ApiContent2Is, ApplicationContext, Content, ImageContent, StoryPackages}
import play.api.mvc.{RequestHeader, Result => PlayResult}

import scala.concurrent.Future

trait ImageQuery extends ConciergeRepository {

  val contentApiClient: ContentApiClient

  def image(edition: Edition, path: String)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Future[Either[PlayResult, ImageContentPage]] = {
    log.info(s"Fetching image content: $path for edition ${edition.id}")
    val response = contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showFields("all"),
    ) map { response: ItemResponse =>
      val mainContent = response.content.filter(_.isImageContent).map(Content(_))
      mainContent
        .map {
          case content: ImageContent => Right(ImageContentPage(content, StoryPackages(content.metadata.id, response)))
          case _                     => Left(NotFound)
        }
        .getOrElse(Left(NotFound))
    }

    response recover convertApiExceptions
  }
}
