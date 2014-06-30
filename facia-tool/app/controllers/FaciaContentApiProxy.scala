package controllers

import conf.Configuration
import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import implicits.Strings
import play.api.mvc._
import play.api.libs.ws.WS
import model.Cached
import conf.Switches._

object FaciaContentApiProxy extends Controller with Logging with AuthLogging with ExecutionContexts with Strings {

  def proxy(path: String) = AjaxExpiringAuthentication.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val queryString = request.queryString.filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val contentApiHost = Configuration.contentApi.contentApiDraftHost

    val url = s"$contentApiHost/$path?$queryString${Configuration.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"

    log("Proxying tag API query to: %s" format url, request)

    WS.url(url).get().map { response =>
      Cached(60) {
        Ok(response.body).as("application/javascript")
      }
    }
  }

  def json(url: String) = AjaxExpiringAuthentication.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    log("Proxying json request to: %s" format url, request)

    WS.url(url).get().map { response =>
      Cached(60) {
        Ok(response.body).as("application/json")
      }
    }
  }
}
