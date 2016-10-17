package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common._
import contentapi.ContentApiClient
import conf._
import conf.switches.Switches
import model._
import play.api.mvc._
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class InteractivePage (interactive: Interactive, related: RelatedContent) extends ContentPage {
  override lazy val item = interactive
}

class InteractiveController(contentApiClient: ContentApiClient) extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  def renderInteractiveJson(path: String): Action[AnyContent] = renderInteractive(path)
  def renderInteractive(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  private def lookup(path: String)
                    (implicit request: RequestHeader): Future[Either[InteractivePage, Result]] = {
    val edition = Edition(request)
    log.info(s"Fetching interactive: $path for edition $edition")
    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient.item(path, edition)
        .showFields("all")
        .showAtoms("all")
    )

    val result = response map { response =>
      val interactive = response.content map {Interactive.make}
      val page = interactive.map(i => InteractivePage(i, StoryPackages(i, response)))

      ModelOrResult(page, response)
    }

    result recover convertApiExceptions
  }


  private def render(model: InteractivePage)(implicit request: RequestHeader) = {
    val htmlResponse = () => views.html.interactive(model)
    val jsonResponse = () => views.html.fragments.interactiveBody(model)
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = lookup(path) map {
    case Left(model) if model.interactive.content.isExpired => RenderOtherStatus(Gone) // TODO - delete this line after switching to new content api
    case Left(model) => render(model)
    case Right(other) => RenderOtherStatus(other)
  }

  override def canRender(i: ItemResponse): Boolean = i.content.exists(_.isInteractive)
}
