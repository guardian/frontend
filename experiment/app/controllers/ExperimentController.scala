package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import contentapi.ContentApiClient
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.{BaseController, ControllerComponents}
import renderers.DotcomRenderingService

import scala.concurrent.Future

class ExperimentController(
    contentApiClient: ContentApiClient,
    remoteRenderer: DotcomRenderingService,
    ws: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def healthCheck() = Action.async(Future.successful(Ok("OK")))

  def renderExperiment(experimentId: String) = {
    Action.async { implicit request =>
      remoteRenderer.getExperiment(ws, experimentId)
    }
  }
}
