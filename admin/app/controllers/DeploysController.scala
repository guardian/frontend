package controllers.admin

import common.Logging
import implicits.Requests
import model.deploys.{ApiResults, RiffRaffService}
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._
import model.deploys._
import play.api.libs.ws.WSClient

trait DeploysController extends Controller with Logging with Requests {

  val riffRaff: RiffRaffService

  def getDeploys(pageSize: Option[String], projectName: Option[String], stage: Option[String]) = Action.async {
    riffRaff.getRiffRaffDeploys(pageSize, projectName, stage, Some("Completed")).map(ApiResults(_))
  }

}

class DeploysControllerImpl(wsClient: WSClient) extends DeploysController {
  val httpClient = new HttpClient(wsClient)
  override val riffRaff = new RiffRaffService(httpClient)
}

