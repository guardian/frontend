package controllers

import conf.Configuration
import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import implicits.Strings
import play.api.mvc._
import play.api.libs.ws.WS
import model.Cached
import implicits.WSRequests.WsWithAuth
import auth.ExpiringActions
import util.ContentUpgrade.rewriteBody

object FaciaContentApiProxy extends Controller with Logging with AuthLogging with ExecutionContexts with Strings {

  import play.api.Play.current

  def capi(path: String) = ExpiringActions.ExpiringAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val queryString = request.queryString.filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val contentApiHost = Configuration.contentApi.contentApiDraftHost

    val url = s"$contentApiHost/$path?$queryString${Configuration.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"

    log("Proxying tag API query to: %s" format url, request)

    WS.url(url).withPreviewAuth.get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/javascript")
      }
    }
  }

  def http(url: String) = ExpiringActions.ExpiringAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()

    WS.url(url).withPreviewAuth.get().map { response =>
      Cached(60) {
        Ok(response.body).as("text/html")
      }
    }
  }

  def json(url: String) = ExpiringActions.ExpiringAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    log("Proxying json request to: %s" format url, request)

    WS.url(url).withPreviewAuth.get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/json")
      }
    }
  }
}
