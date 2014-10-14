package controllers

import common._
import conf._
import model._
import play.api.mvc._
import scala.concurrent.Future
import com.gu.openplatform.contentapi.model.ItemResponse
import views.support.RenderOtherStatus

case class InteractivePage (interactive: Interactive, related: RelatedContent)

object InteractiveController extends Controller with Logging with ExecutionContexts {

  def renderInteractiveJson(path: String): Action[AnyContent] = renderInteractive(path)
  def renderInteractive(path: String): Action[AnyContent] = Action.async { implicit request =>

    lookup(path) map {
      case Left(model) if model.interactive.isExpired => RenderOtherStatus(Gone) // TODO - delete this line after switching to new content api
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[InteractivePage, Result]] = {
    val edition = Edition(request)
    log.info(s"Fetching interactive: $path for edition $edition")
    val response: Future[ItemResponse] = LiveContentApi.item(path, edition)
      .showExpired(true)
      .showFields("all")
      .response

    val result = response map { response =>
      val storyPackage = response.storyPackage map { Content(_) }
      val interactive = response.content map { Interactive(_) }
      val page = interactive.map(i => InteractivePage(i, RelatedContent(i, response)))

      ModelOrResult(page, response)
    }

    result recover convertApiExceptions
  }


  private def render(model: InteractivePage)(implicit request: RequestHeader) = {
    val htmlResponse = () => views.html.interactive(model)
    val jsonResponse = () => views.html.fragments.interactiveBody(model)
    renderFormat(htmlResponse, jsonResponse, model.interactive, Switches.all)
  }
}
