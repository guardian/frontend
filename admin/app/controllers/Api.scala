package controllers.admin

import conf.Configuration
import controllers.AuthLogging
import common.{ExecutionContexts, Logging}
import implicits.Strings
import play.api.mvc._
import play.api.libs.ws.WS
import model.NoCache

class Api extends Controller with Logging with AuthLogging with ExecutionContexts with Strings {

  import play.api.Play.current

  def proxy(path: String, callback: String) = AuthActions.AuthActionTest.async { request =>
    val queryString = request.queryString.map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val url = s"${Configuration.contentApi.contentApiHost}/$path?$queryString${Configuration.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"

    log("Proxying tag API query to: %s" format url, request)

    WS.url(url).get().map { response =>
      NoCache(Ok(response.body).as("application/javascript"))
    }
  }

  def tag(q: String, callback: String) = AuthActions.AuthActionTest.async { request =>
    val url = "%s/tags?format=json&page-size=50%s&callback=%s&q=%s".format(
      Configuration.contentApi.contentApiHost,
      Configuration.contentApi.key.map(key => s"&api-key=$key").getOrElse(""),
      callback.javascriptEscaped.urlEncoded,
      q.javascriptEscaped.urlEncoded
    )

    log("Proxying tag API query to: %s" format url, request)

    WS.url(url).get().map { response =>
      NoCache(Ok(response.body).as("application/javascript"))
    }
  }

  def item(path: String, callback: String) = AuthActions.AuthActionTest.async { request =>
    val url = "%s/%s?format=json&page-size=1%s&callback=%s".format(
      Configuration.contentApi.contentApiHost,
      path.javascriptEscaped.urlEncoded,
      Configuration.contentApi.key.map(key => s"&api-key=$key").getOrElse(""),
      callback.javascriptEscaped.urlEncoded
    )

    log("Proxying item API query to: %s" format url, request)

    WS.url(url).get().map { response =>
      NoCache(Ok(response.body).as("application/javascript"))
    }
  }

  def json(url: String) = AuthActions.AuthActionTest.async { request =>
    log("Proxying json request to: %s" format url, request)

    WS.url(url).get().map { response =>
      NoCache(Ok(response.body).as("application/json"))
    }
  }
}
