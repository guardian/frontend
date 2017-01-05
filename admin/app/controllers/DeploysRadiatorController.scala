package controllers.admin

import common.Logging
import implicits.Requests
import model.NoCache
import model.deploys.{ApiResults, RiffRaffService}
import model.deploys.ApiResults.{ApiError, ApiErrors}
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._
import model.deploys._
import play.api.libs.ws.WSClient
import scala.util.control.NonFatal

trait DeploysRadiatorController extends Controller with Logging with Requests {

  val riffRaff: RiffRaffService
  val teamcity: TeamcityService

  def getCompletedDeploys(pageSize: Option[String], projectName: Option[String], stage: Option[String]) = Action.async {
    riffRaff.getRiffRaffDeploys(pageSize, projectName, stage, Some("Completed")).map(ApiResults(_))
  }

  def getDeploys(pageSize: Option[String], projectName: Option[String], stage: Option[String], status: Option[String] = None) = Action.async {
    riffRaff.getRiffRaffDeploys(pageSize, projectName, stage, status).map(ApiResults(_))
  }

  def getBuild(number: String) = Action.async {
    teamcity
      .getBuild(number)
      .map(build => Right(build))
      .recover { case NonFatal(error) => Left(ApiErrors(List(ApiError(error.getMessage, 500)))) }
      .map(ApiResults(_))

  }

  def renderDeploysRadiator() = Action {
    NoCache(Ok(views.html.deploysRadiator.main()))
  }

}

class DeploysRadiatorControllerImpl(wsClient: WSClient) extends DeploysRadiatorController {
  val httpClient = new HttpClient(wsClient)
  override val riffRaff = new RiffRaffService(httpClient)
  override val teamcity = new TeamcityService(httpClient)
}

