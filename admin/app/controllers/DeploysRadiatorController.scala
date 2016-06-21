package controllers.admin

import common.Logging
import controllers.AuthLogging
import implicits.Requests
import model.NoCache
import model.deploys.{RiffRaffService, ApiResults}
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._
import model.deploys._

trait DeploysRadiatorController extends Controller with Logging with AuthLogging with Requests {

  val riffRaff: RiffRaffService
  val teamcity: TeamcityService

  def getDeploys(pageSize: Option[String], projectName: Option[String], stage: Option[String]) = AuthActions.AuthActionTest.async {
    riffRaff.getRiffRaffDeploys(pageSize, projectName, stage).map(ApiResults(_))
  }

  def getBuild(number: String) = AuthActions.AuthActionTest.async {
    teamcity.getTeamCityBuild(number).map(ApiResults(_))
  }

  def renderDeploysRadiator() = AuthActions.AuthActionTest {
    NoCache(Ok(views.html.deploysRadiator.main()))
  }

}

class DeploysRadiatorControllerImpl extends DeploysRadiatorController {
  override val riffRaff = RiffRaffService
  override val teamcity = TeamcityService
}

