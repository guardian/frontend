package controllers

import conf.{CachedHealthCheck, HealthCheckPolicy, HealthCheckPrecondition, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.ConfigAgent
import play.api.mvc.AbstractController
import scala.concurrent.ExecutionContext
import renderers.DotcomRenderingService
import play.api

class ProutCheck(
    wsClient: WSClient,
    components: ControllerComponents,
)(implicit ec: ExecutionContext)
    extends AbstractController(components) {
  def getDCRProut() =
    Action.async { implicit request =>
      {
        DotcomRenderingService().getProut(wsClient)(request).map(result => Ok(result))
      }
    }
}
