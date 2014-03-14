package services

import model._
import conf.SwitchingContentApi
import common._
import contentapi.QueryDefaults
import controllers.ImageContentPage
import scala.concurrent.Future
import play.api.mvc.SimpleResult

trait ImageQuery extends ConciergeRepository with QueryDefaults {

  def image(edition: Edition, path: String): Future[Either[ImageContentPage, SimpleResult]]= {
    log.info(s"Fetching image content: $path for edition ${edition.id}")
    val response = SwitchingContentApi().item(path, edition)
      .showExpired(true)
      .showFields("all")
      .response.map { response =>
      val mainContent: Option[Content] = response.content.filter { c => c.isImageContent } map {Content(_)}
      val storyPackage: List[Trail] = response.storyPackage map { Content(_) }
      mainContent.map { content => Left(ImageContentPage(content,storyPackage)) }.getOrElse(Right(NotFound))
    }

    response recover convertApiExceptions
  }
}
