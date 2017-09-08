package controllers.front

import common.{FaciaPressMetrics, Logging, StopWatch}
import conf.Configuration
import model.PressedPage
import play.api.libs.json._
import play.api.libs.ws.WSClient
import services.SecureS3Request

import scala.concurrent.{ExecutionContext, Future}

trait FrontJsonFapi extends Logging {
  lazy val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String

  val wsClient: WSClient
  val secureS3Request = new SecureS3Request(wsClient)

  private def getAddressForPath(path: String): String = s"$bucketLocation/${path.replaceAll("""\+""", "%2B")}/fapi/pressed.v2.json"

  def getRaw(path: String)(implicit executionContext: ExecutionContext): Future[Option[JsValue]] = {
    val response = secureS3Request.urlGet(getAddressForPath(path)).get()
    response.map { r =>
      r.status match {
        case 200 =>
          Some(r.json)
        case 403 =>
          log.warn(s"Got 403 trying to load path: $path")
          None
        case 404 =>
          log.warn(s"Got 404 trying to load path: $path")
          None
        case responseCode =>
          log.warn(s"Got $responseCode trying to load path: $path")
          None
      }
    }
  }

  def get(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] =
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
}

class FrontJsonFapiLive(val wsClient: WSClient) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/live"
}

class FrontJsonFapiDraft(val wsClient: WSClient) extends FrontJsonFapi {
  val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}
