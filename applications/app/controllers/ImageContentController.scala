package controllers

import common._
import conf._
import model._
import play.api.mvc.{SimpleResult, RequestHeader, Controller, Action}
import com.gu.openplatform.contentapi.model.{Content => ApiContent,ItemResponse}
import scala.concurrent.Future

case class ImageContentPage(image: Content, storyPackage: List[Trail])

object ImageContentController extends Controller with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)

  def render(path: String) = Action.async { implicit request =>
    lookup(path).map {
        case Left(content) => renderImageContent(content)
        case Right(result) => result
    }
  }

  private def renderImageContent(page: ImageContentPage)(implicit request: RequestHeader): SimpleResult = {
    val htmlResponse = () => views.html.imageContent(page)
    val jsonResponse = () => views.html.fragments.imageContentBody(page)
    renderFormat(htmlResponse, jsonResponse, page.image, Switches.all)
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[ImageContentPage, SimpleResult]]= {
    val edition = Edition(request)
    log.info(s"Fetching image content: $path for edition ${edition.id}")
    val response = ContentApi.item(path, edition)
      .showExpired(true)
      .showFields("all")
      .response.map { response =>
        val mainContent: Option[Content] = response.content.filter { c => c.isImageContent } map {Content(_)}
        val storyPackage: List[Trail] = response.storyPackage map { Content(_) }
        mainContent.map { content => Left(ImageContentPage(content,storyPackage)) }.getOrElse(Right(NotFound))
      }

    response recover suppressApiNotFound
  }
}
