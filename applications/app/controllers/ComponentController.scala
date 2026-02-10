package controllers

import common._
import implicits.AppsFormat
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService

import scala.concurrent.Future

class ComponentController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        // only supported for dcr=apps
        case AppsFormat => remoteRenderer.getAppsComponent(wsClient, path)
        case _          => Future.successful(NotFound)
      }
    }
}
