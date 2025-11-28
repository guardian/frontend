package controllers

import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import renderers.DotcomRenderingService

class DCARAssetsController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
) extends BaseController {
  def renderAsset(): Action[AnyContent] = {
    Action.async { implicit request =>
      remoteRenderer.getDCARAssets(wsClient, "/assets/rendered-items-assets")
    }
  }
}
