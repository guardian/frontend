package controllers.admin

import play.api.mvc.Controller
import common.Logging
import controllers.AuthLogging
import tools.CloudWatch
import play.api.libs.ws.WS
import com.ning.http.client.Realm
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json
import conf.Configuration

object RadiatorController extends Controller with Logging with AuthLogging {

  // if you are reading this you are probably being rate limited...

  // you can read about github rate limiting here http://developer.github.com/v3/#rate-limiting

  // If you want a personal token you can create one here https://github.com/settings/tokens/new
  // but realise it is a PERSONAL token setup against YOUR github account
  // put it in your properties file as github.token=XXXXXXX
  lazy val githubAccessToken = Configuration.github.token.map{ token => s"?access_token=$token" }.getOrElse("")


  // proxy call to github so we do not leak the access key
  def commitDetail(hash: String) = Authenticated.async { implicit request =>
    val call = WS.url(s"https://api.github.com/repos/guardian/frontend/commits/$hash$githubAccessToken").get()
    call.map{ c =>
      Ok(c.body).withHeaders("Content-Type" -> "application/json; charset=utf-8")
    }
  }

  def renderRadiator() = Authenticated { implicit request =>
    val graphs = CloudWatch.latencyShortStack ++ CloudWatch.fastlyStatistics
    val multilineGraphs = CloudWatch.fastlyHitMissStatistics
    Ok(views.html.radiator(graphs, multilineGraphs, CloudWatch.cost, Configuration.environment.stage))
  }

  def pingdom() = Authenticated.async { implicit request =>
  
    val url = Configuration.pingdom.url + "/checks" 
    val user = Configuration.pingdom.user
    val password = Configuration.pingdom.password
    val apiKey = Configuration.pingdom.apiKey

    WS.url(url)
      .withAuth(user, password,  Realm.AuthScheme.BASIC)
      .withHeaders("App-Key" ->  apiKey)
      .get().map { response =>
        Ok(Json.toJson(response.body))
      }
  }
}
