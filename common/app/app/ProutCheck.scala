package controllers

import play.api.libs.ws.WSClient
import play.api.mvc.{ControllerComponents, AbstractController}
import scala.concurrent.ExecutionContext
import renderers.DotcomRenderingService

class ProutCheck(
    wsClient: WSClient,
    components: ControllerComponents,
)(implicit ec: ExecutionContext)
    extends AbstractController(components) {

  val remoteRenderer = DotcomRenderingService()

  def getDCRProut() =
    Action.async { implicit request =>
      {
        remoteRenderer.getProut(wsClient)(request).map(result => Ok(result))
      }
    }
}
