package controllers

import common._
import conf._
import model._
import play.api.mvc.{SimpleResult, RequestHeader, Controller, Action}
import services.ImageQuery

case class ImageContentPage(image: Content, storyPackage: List[Trail])

object ImageContentController extends Controller with ImageQuery with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)

  def render(path: String) = Action.async { implicit request =>
    image(Edition(request), path).map {
        case Left(content) => renderImageContent(content)
        case Right(result) => result
    }
  }

  private def renderImageContent(page: ImageContentPage)(implicit request: RequestHeader): SimpleResult = {
    val htmlResponse = () => views.html.imageContent(page)
    val jsonResponse = () => views.html.fragments.imageContentBody(page)
    renderFormat(htmlResponse, jsonResponse, page.image, Switches.all)
  }
}
