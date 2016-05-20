package discussion.util

import play.api.libs.ws.{WS, WSResponse}
import play.api.libs.json.{Json, JsValue}
import common.Logging
import scala.concurrent._
import ExecutionContext.Implicits.global

trait Http extends Logging {

  protected def getJsonOrError(url: String, onError: (WSResponse) => String, headers: (String, String)*): Future[JsValue] = {
    GET(url, headers: _*) map {
      response =>
        response.status match {
          case 200 =>
            Json.parse(response.body)

          case _ =>
            log.error(onError(response))
            throw new RuntimeException(onError(response))
        }
    }
  }

  protected def GET(url: String, headers: (String, String)*): Future[WSResponse] = {
    import play.api.Play.current
    log.debug(s"GET $url")
    WS.url(url).withHeaders(headers: _*).withRequestTimeout(2000).get()
  }

}
