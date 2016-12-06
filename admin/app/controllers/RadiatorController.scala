package controllers.admin

import implicits.Requests
import play.api.mvc.{Action, Controller}
import common.Logging
import tools.CloudWatch
import play.api.libs.ws.{WSAuthScheme, WSClient}
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json
import conf.Configuration
import model.NoCache
import conf.switches.{Switch, Switches}
import model.deploys.{HttpClient, TeamCityBuild, TeamcityService}
import play.api.Environment

import scala.concurrent.Future

class RadiatorController(wsClient: WSClient)(implicit env: Environment) extends Controller with Logging with Requests{

  // if you are reading this you are probably being rate limited...
  // you can read about github rate limiting here http://developer.github.com/v3/#rate-limiting
  // If you want a personal token you can create one here https://github.com/settings/tokens/new
  // but realise it is a PERSONAL token setup against YOUR github account
  // put it in your properties file as github.token=XXXXXXX
  lazy val githubAccessToken = Configuration.github.token.map{ token => s"?access_token=$token" }.getOrElse("")
  lazy val teamcityService = new TeamcityService(new HttpClient(wsClient))

  def switchesExpiringSoon = {
    Switches.all.filter(Switch.expiry(_).hasExpired) ++ // already expired
    Switches.all.filter(Switch.expiry(_).daysToExpiry.exists(_ == 0)) ++ // expiring today
    Switches.all.filter(Switch.expiry(_).daysToExpiry.exists(_ == 1)) // expiring tomorrow
  }

  // proxy call to github so we do not leak the access key
  def commitDetail(hash: String) = Action.async { implicit request =>
    val call = wsClient.url(s"https://api.github.com/repos/guardian/frontend/commits/$hash$githubAccessToken").get()
    call.map{ c =>
      NoCache(Ok(c.body).withHeaders("Content-Type" -> "application/json; charset=utf-8"))
    }
  }
  def renderRadiator() = Action.async { implicit request =>
    val apiKey = Configuration.riffraff.apiKey

    def mostRecentBuildForProjects(projects: String*): Future[Seq[TeamCityBuild]] = {
      Future.sequence(projects.map { project =>
        teamcityService
          .getBuilds(project, 1)
          .map(_.head)
      })
    }

    for {
      ciBuilds <- mostRecentBuildForProjects("dotcom_master", "dotcom_ampValidation")
      router50x <- CloudWatch.routerBackend50x
      latencyGraphs <- CloudWatch.shortStackLatency
      fastlyErrors <- CloudWatch.fastlyErrors
      fastlyHitMiss <- CloudWatch.fastlyHitMissStatistics
      cost <- CloudWatch.cost
    } yield {
      val errorGraphs = Seq(router50x)
      val fastlyGraphs = fastlyErrors ++ fastlyHitMiss
      NoCache(Ok(views.html.radiator(
        ciBuilds, errorGraphs, latencyGraphs, fastlyGraphs, cost, switchesExpiringSoon, apiKey
      )))
    }
  }
}
