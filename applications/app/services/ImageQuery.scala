package services

import com.gu.contentapi.client.model.ItemResponse
import common.Edition
import model.ApiContent2Is
import common._
import conf.{InlineRelatedContentSwitch, LiveContentApi}
import controllers.ImageContentPage
import model.{RelatedContent, Trail, Content}
import play.api.mvc.{Result => PlayResult}

import scala.concurrent.Future

trait ImageQuery extends ConciergeRepository {
  def image(edition: Edition, path: String): Future[Either[ImageContentPage, PlayResult]] = {
    log.info(s"Fetching image content: $path for edition ${edition.id}")
    val response = LiveContentApi.item(path, edition)
      .showFields("all")
      .showRelated(InlineRelatedContentSwitch.isSwitchedOn)
      .response map { response: ItemResponse =>
        val mainContent = response.content.filter(_.isImageContent).map(Content(_))
        val storyPackage: List[Trail] = response.storyPackage.map(Content(_))
        mainContent.map { content =>
          Left(ImageContentPage(content, RelatedContent(content, response)))
        }.getOrElse(Right(NotFound))
      }

    response recover convertApiExceptions
  }
}
