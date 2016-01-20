package controllers.admin

import implicits.Requests
import play.api.mvc.Controller
import common.Logging
import controllers.AuthLogging
import tools.CloudWatch
import play.api.libs.ws.WS
import play.api.libs.ws.WSAuthScheme
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json
import conf.Configuration
import model.NoCache
import conf.switches.{Switch, Switches}
import org.joda.time.LocalDate
import play.api.Play.current

object RadiatorController extends Controller with Logging with AuthLogging with Requests{

  // if you are reading this you are probably being rate limited...
  // you can read about github rate limiting here http://developer.github.com/v3/#rate-limiting
  // If you want a personal token you can create one here https://github.com/settings/tokens/new
  // but realise it is a PERSONAL token setup against YOUR github account
  // put it in your properties file as github.token=XXXXXXX
  lazy val githubAccessToken = Configuration.github.token.map{ token => s"?access_token=$token" }.getOrElse("")

  def switchesExpiringThisWeek = {
    Switches.all.filter { switch =>
      Switch.expiry(switch).expiresSoon
    }
  }

  // proxy call to github so we do not leak the access key
  def commitDetail(hash: String) = AuthActions.AuthActionTest.async { implicit request =>
    val call = WS.url(s"https://api.github.com/repos/guardian/frontend/commits/$hash$githubAccessToken").get()
    call.map{ c =>
      NoCache(Ok(c.body).withHeaders("Content-Type" -> "application/json; charset=utf-8"))
    }
  }
  def renderRadiator() = AuthActions.AuthActionTest.async { implicit request =>

    // Some features do not work outside our network
    // /radiator?features=external disables these
    val external = request.getParameter("features").contains("external")

    for {
      user50x <- CloudWatch.user50x
      shortLatency <- CloudWatch.shortStackLatency
      fastlyErrors <- CloudWatch.fastlyErrors
      multiLineGraphs <- CloudWatch.fastlyHitMissStatistics
      cost <- CloudWatch.cost
    } yield {
      val graphs = Seq(user50x) ++ shortLatency ++ fastlyErrors
      NoCache(Ok(views.html.radiator(
        graphs, multiLineGraphs, cost, switchesExpiringThisWeek,
        Configuration.environment.stage, external
      )))
    }
  }

  def pingdom() = AuthActions.AuthActionTest.async { implicit request =>
    val url = Configuration.pingdom.url + "/checks"
    val user = Configuration.pingdom.user
    val password = Configuration.pingdom.password
    val apiKey = Configuration.pingdom.apiKey

    WS.url(url)
      .withAuth(user, password,  WSAuthScheme.BASIC)
      .withHeaders("App-Key" ->  apiKey)
      .get().map { response =>
        NoCache(Ok(Json.parse(response.body)))
      }
  }
}
