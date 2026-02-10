package controllers

import common._
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService

class ComponentController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      remoteRenderer.getComponent(wsClient, path)
    }
}
