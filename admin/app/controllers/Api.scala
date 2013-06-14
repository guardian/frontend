package controllers

import implicits._

import play.api.mvc._
import conf._
import common.Logging
import play.api.libs.ws.WS

object Api extends Controller with Logging with AuthLogging with ExecutionContexts with Strings {

  def proxy(path: String, callback: String) = AuthAction { request =>
    val queryString = request.queryString.map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val url = s"${Configuration.contentApi.host}/$path?$queryString&api-key=${Configuration.contentApi.key}"

    log("Proxying tag API query to: %s" format url, request)

    Async {
      WS.url(url).get().map { response =>
        Ok(response.body).as("application/javascript")
      }
    }
  }

  def tag(q: String, callback: String) = AuthAction { request =>
    val url = "%s/tags?format=json&page-size=50&api-key=%s&callback=%s&q=%s".format(
      Configuration.contentApi.host,
      Configuration.contentApi.key,
      callback.javascriptEscaped.urlEncoded,
      q.javascriptEscaped.urlEncoded
    )

    log("Proxying tag API query to: %s" format url, request)

    Async {
      WS.url(url).get().map { response =>
        Ok(response.body).as("application/javascript")
      }
    }
  }

  def item(path: String, callback: String) = AuthAction { request =>
    val url = "%s/%s?format=json&page-size=1&api-key=%s&callback=%s".format(
      Configuration.contentApi.host,
      path.javascriptEscaped.urlEncoded,
      Configuration.contentApi.key,
      callback.javascriptEscaped.urlEncoded
    )

    log("Proxying item API query to: %s" format url, request)

    Async {
      WS.url(url).get().map { response =>
        Ok(response.body).as("application/javascript")
      }
    }
  }

  def json(url: String) = AuthAction { request =>
    log("Proxying json request to: %s" format url, request)

    Async {
      WS.url(url).get().map { response =>
        Ok(response.body).as("application/json")
      }
    }
  }
}
