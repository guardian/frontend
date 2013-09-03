package controllers

import conf.AdminConfiguration
import common.{ExecutionContexts, Logging}
import implicits.Strings
import play.api.mvc._
import play.api.libs.ws.WS

object OphanApi extends Controller with Logging with AuthLogging with ExecutionContexts with Strings {

  def pageViews(path: String) = AuthAction { request =>
    (for {
      host <- AdminConfiguration.ophanApi.host
      key  <- AdminConfiguration.ophanApi.key
    } yield {
      val url = "%s/breakdown?api-key=%s&path=/%s".format(
        host,
        key,
        path
      )

      log("Proxying Ophan pageviews query to: %s" format url, request)

      Async {
        WS.url(url).get().map { response =>
          Ok(response.body).as("application/json")
        }
      }

    }).getOrElse(Ok)
  }

}
