package controllers

import play.api.mvc.Controller
import common.Logging
import tools.{PageviewsByDayGraph, CloudWatch}
import model.MetaData
import conf.Switches
import play.api.libs.ws.WS
import com.ning.http.client.Realm
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json
import conf.Configuration

object RadiatorController extends Controller with Logging with AuthLogging {

  def render() = AuthAction{ implicit request =>
      val graphs = (CloudWatch.latency filter { _.name == "Router" }) ++ CloudWatch.fastlyStatistics
      Ok(views.html.radiator(graphs, Configuration.environment.stage))
  }

  def pingdom() = AuthAction{ implicit request =>
  
    val url = Configuration.pingdom.url + "/checks" 
    val user = Configuration.pingdom.user
    val password = Configuration.pingdom.password
    val apiKey = Configuration.pingdom.apiKey

    Async {
          WS.url(url)
            .withAuth(user, password,  Realm.AuthScheme.BASIC)
            .withHeaders("App-Key" ->  apiKey)
            .get().map { response =>
              Ok(Json.toJson(response.body))
            }
      }
  }

}
