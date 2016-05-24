package discussion.util

import play.api.libs.ws.{WS, WSResponse}
import play.api.libs.json.{JsValue, Json}
import common.{ExecutionContexts, Logging, StopWatch}
import scala.concurrent.Future

trait Http extends Logging with ExecutionContexts {

  protected def getJsonOrError(url: String, onError: (WSResponse) => String, headers: (String, String)*): Future[JsValue] = {
    val stopWatch = new StopWatch
    GET(url, headers: _*) map {
      response =>
        response.status match {
          case 200 =>
            log.info(s"DAPI responded successfully in ${stopWatch.elapsed} ms for url: ${url}")
            Json.parse(response.body)
          case _ =>
            log.error(onError(response))
            throw new RuntimeException(onError(response))
        }
    }
  }

  protected def GET(url: String, headers: (String, String)*): Future[WSResponse] = {
    import play.api.Play.current
    WS.url(url).withHeaders(headers: _*).withRequestTimeout(2000).get()
  }

}
