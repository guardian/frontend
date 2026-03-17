package services

import com.gu.contentapi.client.model.v1.{Block, Blocks, ItemResponse}
import common.{Edition, _}
import contentapi.ContentApiClient
import model.{ApiContent2Is, ApplicationContext, Content, ImageContent, ImageContentPage, StoryPackages}
import play.api.mvc.{RequestHeader, Result => PlayResult}

import scala.concurrent.Future

trait ImageQuery extends ConciergeRepository {

  val contentApiClient: ContentApiClient

  def image(edition: Edition, path: String)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Future[Either[PlayResult, (ImageContentPage, Option[Block])]] = {
    logDebugWithRequestId(s"Fetching image content: $path for edition ${edition.id}")
    val response = contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showBlocks("main")
        .showFields("all"),
    ) map { response: ItemResponse =>
      val mainContent = response.content.filter(_.isImageContent).map(Content(_))
      val mainBlock = response.content.flatMap(_.blocks).getOrElse(Blocks()).main
      mainContent
        .map {
          case content: ImageContent =>
            Right(
              ImageContentPage(content, StoryPackages(content.metadata.id, response)),
              mainBlock,
            )
          case _ => Left(NotFound)
        }
        .getOrElse(Left(NotFound))
    }

    response recover convertApiExceptions
  }
}
