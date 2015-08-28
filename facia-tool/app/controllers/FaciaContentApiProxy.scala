package controllers

import conf.Configuration
import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import implicits.Strings
import play.api.mvc._
import play.api.libs.ws.WS
import model.Cached
import akka.actor.ActorSystem
import util.ContentUpgrade.rewriteBody
import play.api.Logger
import auth.PanDomainAuthActions

object FaciaContentApiProxy extends Controller with Logging with ExecutionContexts with Strings with PanDomainAuthActions with implicits.WSRequests {

  override lazy val actorSystem = ActorSystem()
  import play.api.Play.current

  def capiPreview(path: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val queryString = request.queryString.filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val contentApiHost = Configuration.contentApi.contentApiDraftHost

    val url = s"$contentApiHost/$path?$queryString${Configuration.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"

    Logger.info("Proxying tag API query to: %s".format(url, request))

    WS.url(url).withPreviewAuth.get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/javascript")
      }
    }
  }

  def capiLive(path: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val queryString = request.queryString.filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val contentApiHost = Configuration.contentApi.contentApiLiveHost

    val url = s"$contentApiHost/$path?$queryString${Configuration.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"

    Logger.info("Proxying tag API query to: %s".format(url, request))

    WS.url(url).get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/javascript")
      }
    }
  }

  def http(url: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()

    WS.url(url).get().map { response =>
      Cached(60) {
        Ok(response.body).as("text/html")
      }
    }
  }

  def json(url: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    Logger.info("Proxying json request to: %s".format(url, request))

    WS.url(url).withPreviewAuth.get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/json")
      }
    }
  }

  def ophan(path: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val paths = request.queryString.get("path").map(_.mkString("path=", "&path=", "")).getOrElse("")
    val queryString = request.queryString.filterNot(_._1 == "path").filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")
    val ophanApiHost = Configuration.ophanApi.host.get
    val ophanKey = Configuration.ophanApi.key.map(key => s"&api-key=$key").getOrElse("")

    val url = s"$ophanApiHost/$path?$queryString&$paths&$ophanKey"

    Logger.info("Proxying ophan request to: %s".format(url, request))

    WS.url(url).get().map { response =>
      Cached(60) {
        Ok(response.body).as("application/json")
      }
    }
  }
}
