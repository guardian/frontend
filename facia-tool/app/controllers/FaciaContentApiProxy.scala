package controllers

import conf.Configuration
import common.{ExecutionContexts, Logging}
import implicits.Strings
import play.api.mvc._
import play.api.libs.ws.WS

object FaciaContentApiProxy extends Controller with Logging with AuthLogging with ExecutionContexts with Strings {

  def proxy(path: String) = AjaxExpiringAuthentication.async { request =>
    val queryString = request.queryString.map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val url = s"${Configuration.contentApi.host}/$path?$queryString&api-key=${Configuration.contentApi.key}"

    log("Proxying tag API query to: %s" format url, request)

    WS.url(url).get().map { response =>
      Ok(response.body).as("application/javascript")
    }
  }

  def json(url: String) = AjaxExpiringAuthentication.async { request =>
    log("Proxying json request to: %s" format url, request)

    WS.url(url).get().map { response =>
      Ok(response.body).as("application/json")
    }
  }
}
