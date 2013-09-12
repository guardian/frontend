package controllers

import conf.Configuration.ophanApi
import common.{ExecutionContexts, Logging}
import implicits.Strings
import play.api.mvc._
import play.api.libs.ws.WS

object OphanApi extends Controller with Logging with AuthLogging with ExecutionContexts with Strings {

  def pageViews(path: String) = AuthAction { request =>
      val url = "%s/breakdown?api-key=%s&path=/%s".format(
        ophanApi.host,
        ophanApi.key,
        path
      )

      log("Proxying Ophan pageviews query to: %s" format url, request)

      Async {
        WS.url(url).get().map { response =>
          Ok(response.body).as("application/json")
        }
      }
  }

  def platformPageViews() = AuthAction { request =>
      val url = "%s/breakdown?platform=next-gen&hours=2&api-key=%s".format(
        ophanApi.host,
        ophanApi.key
      )

      log("Proxying Ophan pageviews query to: %s" format url, request)

      Async {
        WS.url(url).get().map { response =>
          Ok(response.body).as("application/json")
        }
      }
  }


}
