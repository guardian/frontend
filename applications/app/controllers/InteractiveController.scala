package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common._
import contentapi.ContentApiClient
import conf._
import conf.switches.Switches
import model.Cached.RevalidatableResult
import model._
import play.api.libs.iteratee.Enumerator
import play.api.libs.ws.{WSResponse, WSClient}
import play.api.mvc._
import views.support.RenderOtherStatus
import conf.Configuration.interactive.cdnPath
import conf.Configuration.environment.isPreview
import scala.concurrent.duration._

import scala.concurrent.Future

case class InteractivePage (interactive: Interactive, related: RelatedContent) extends ContentPage {
  override lazy val item = interactive
}

class InteractiveController(contentApiClient: ContentApiClient, wsClient: WSClient) extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  def renderInteractiveJson(path: String): Action[AnyContent] = renderInteractive(path)
  def renderInteractive(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  def proxyInteractiveServiceworker(path: String): Action[AnyContent] = Action.async { implicit request =>
    val stage = if (isPreview) "preview" else "live"
    val serviceWorkerPath = s"$cdnPath/service-workers/$stage/$path/interactive-service-worker.js"
    /*
      This just passes through the http response from the above url so we don't need to
      match status codes etc and setting the correct cache headers is handled by Cached()
     */

    wsClient.url(serviceWorkerPath).get().map { response =>
      Cached (7 days) {
        RevalidatableResult(convertWSResponseToResult(response), response.body)
      }
    }
  }

  def convertWSResponseToResult(response: WSResponse): Result = {
    val headers = response.allHeaders.map { case (header, body) =>
      (header, body.head)
    }
    Result(ResponseHeader(response.status, headers), Enumerator(response.body.getBytes))
  }

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
