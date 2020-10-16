package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common._
import contentapi.ContentApiClient
import conf.switches.Switches
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.libs.ws.WSClient
import play.api.mvc._
import views.support.RenderOtherStatus
import conf.Configuration.interactive.cdnPath
import experiments.{ActiveExperiments, NGInteractiveDCR}
import pages.InteractiveHtmlPage

import scala.concurrent.duration._
import scala.concurrent.Future

import services._

case class InteractivePage(interactive: Interactive, related: RelatedContent) extends ContentPage {
  override lazy val item = interactive
}

class InteractiveController(
    contentApiClient: ContentApiClient,
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with RendersItemResponse
    with Logging
    with ImplicitControllerExecutionContext {

  def renderInteractiveJson(path: String): Action[AnyContent] = renderInteractive(path)
  def renderInteractive(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  def proxyInteractiveWebWorker(path: String, file: String): Action[AnyContent] =
    Action.async { implicit request =>
      val timestamp = request.getQueryString("timestamp")
      val serviceWorkerPath = getWebWorkerPath(path, file, timestamp)

      wsClient.url(serviceWorkerPath).get().map { response =>
        Cached(365.days) {
          response.status match {
            case 200 =>
              val contentType = response.headers("Content-Type").mkString(",")
              RevalidatableResult(Ok(response.body).as(contentType), response.body)
            case otherStatus => WithoutRevalidationResult(new Status(otherStatus))
          }
        }
      }
    }

  private def getWebWorkerPath(path: String, file: String, timestamp: Option[String]): String = {
    val stage = if (context.isPreview) "preview" else "live"
    val deployPath = timestamp.map(ts => s"$path/$ts").getOrElse(path)

    s"$cdnPath/service-workers/$stage/$deployPath/$file"
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[InteractivePage, Result]] = {
    val edition = Edition(request)
    log.info(s"Fetching interactive: $path for edition $edition")
    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showFields("all")
        .showAtoms("all"),
    )

    val result = response map { response =>
      val interactive = response.content map { Interactive.make }
      val page = interactive.map(i => InteractivePage(i, StoryPackages(i.metadata.id, response)))

      ModelOrResult(page, response)
    }

    result recover convertApiExceptions
  }

  private def render(model: InteractivePage)(implicit request: RequestHeader) = {
    val htmlResponse = () => InteractiveHtmlPage.html(model)
    val jsonResponse = () => views.html.fragments.interactiveBody(model)
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    ApplicationsDotcomRenderingInterface.getRenderingTier(request) match {
      case Legacy => {
        lookup(path) map {
          case Left(model)  => render(model)
          case Right(other) => RenderOtherStatus(other)
        }
      }
      case DotcomRendering => {
        val html: String = ApplicationsDotcomRenderingInterface.getHtmlFromDCR()
        Future.successful(Ok(html))
      }
    }
  }

  override def canRender(i: ItemResponse): Boolean = i.content.exists(_.isInteractive)
}
