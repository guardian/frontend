package services

import common.{FaciaPressMetrics, Logging, StopWatch}
import concurrent.FutureSemaphore
import model.PressedPage
import play.api.libs.json.{JsError, JsSuccess, JsValue, Json}
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}

class PressedPageService(wsClient: WSClient) extends Logging {
  val parallelJsonPresses = 24
  val secureS3Request = new SecureS3Request(wsClient)
  val futureSemaphore = new FutureSemaphore(parallelJsonPresses)

  def get(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"PressedPageService.get $path") {
    futureSemaphore.execute(getPressedPage(path))
  }

  def getPressedPage(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] =
    getRaw(path)
      .map {
        _.flatMap { json =>
          val stopWatch: StopWatch = new StopWatch
          val pressedPage = Json.fromJson[PressedPage](json) match {
            case JsSuccess(page, _) =>
              Option(page)
            case JsError(errors) =>
              log.warn("Could not parse JSON in FrontJson")
              None
          }
          FaciaPressMetrics.FrontDecodingLatency.recordDuration(stopWatch.elapsed)
          pressedPage
        }
      }

  private def getRaw(address: String)(implicit executionContext: ExecutionContext): Future[Option[JsValue]] = {
    val response = secureS3Request.urlGet(address).get()
    response.map { r =>
      r.status match {
        case 200 =>
          Some(r.json)
        case 403 =>
          log.warn(s"Got 403 trying to load path: $address")
          None
        case 404 =>
          log.warn(s"Got 404 trying to load path: $address")
          None
        case responseCode =>
          log.warn(s"Got $responseCode trying to load path: $address")
          None
      }
    }
  }
}
