package controllers.admin

import common.{GuLogging, ImplicitControllerExecutionContext}
import implicits.Requests
import model.NoCache
import model.deploys.{ApiResults, RiffRaffService, _}
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService

trait DeploysController extends BaseController with GuLogging with Requests with ImplicitControllerExecutionContext {

  val riffRaff: RiffRaffService
  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()
  val ws: WSClient

  def getDeploys(stage: Option[String], pageSize: Option[Int] = None): Action[AnyContent] =
    Action.async {
      riffRaff.getRiffRaffDeploys(Some("dotcom:all"), stage, pageSize, Some("Completed")).map(ApiResults(_))
    }

  def getDCRProut()
  Action.async { implicit request =>
    {
      remoteRenderer.getProut(ws)(request)
    }
  }

  def deploy(stage: String, build: Int): Action[AnyContent] =
    Action {
      val msg = s"Build $build has been deployed to $stage"
      log.info(msg) // Logging message so kibana can show deploy in graph
      NoCache(Ok(msg))
    }

}

class DeploysControllerImpl(wsClient: WSClient, val controllerComponents: ControllerComponents)
    extends DeploysController {
  val httpClient = new HttpClient(wsClient)
  override val riffRaff = new RiffRaffService(httpClient)
}
