package discussion.util

import common.LoggingField.LogField
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.libs.json.JsValue
import common.{GuLogging, StopWatch}
import discussion.api.{NotFoundException, OtherException}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._

trait Http extends GuLogging {

  val wsClient: WSClient

  protected def getJsonOrError(url: String, onError: (WSResponse) => String, headers: (String, String)*)(implicit
      executionContext: ExecutionContext,
  ): Future[JsValue] = {
    val stopWatch = new StopWatch
    GET(url, headers: _*) map { response =>
      response.status match {
        case 200 =>
          val dapiLatency = stopWatch.elapsed
          val customFields: List[LogField] = List("dapi.response.latency.millis" -> dapiLatency.toInt)
          logDebugWithCustomFields(s"DAPI responded successfully in ${dapiLatency} ms for url: ${url}", customFields)
          response.json
        case 404 =>
          val errorMessage = onError(response)
          throw NotFoundException(errorMessage)
        case otherStatus =>
          val errorMessage = onError(response)
          log.error(errorMessage)
          throw OtherException(errorMessage)
      }
    }
  }

  protected def GET(url: String, headers: (String, String)*)(implicit
      executionContext: ExecutionContext,
  ): Future[WSResponse] = {
    wsClient
      .url(url)
      .withHttpHeaders(headers: _*)
      .withRequestTimeout(2.seconds)
      .get()
  }

}
