package discussion.util

import play.api.libs.ws.{WS, Response}
import play.api.libs.json.{Json, JsValue}
import java.lang.System._
import common.DiscussionMetrics.DiscussionHttpTimingMetric
import common.Logging
import scala.concurrent._
import ExecutionContext.Implicits.global


trait Http extends Logging {

  protected def getJsonOrError(url: String, onError: (Response) => String, headers: (String, String)*): Future[JsValue] = {
    val start = currentTimeMillis()
    GET(url, headers: _*) map {
      response =>
        DiscussionHttpTimingMetric.recordTimeSpent(currentTimeMillis - start)

        response.status match {
          case 200 =>
            Json.parse(response.body)

          case _ =>
            log.error(onError(response))
            throw new RuntimeException(onError(response))
        }
    }
  }

  protected def GET(url: String, headers: (String, String)*): Future[Response] = {
    log.debug(s"GET $url")
    WS.url(url).withHeaders(headers: _*).withRequestTimeout(5000).get()
  }

}
