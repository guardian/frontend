package controllers.front

import common.{ExecutionContexts, Logging, S3Metrics}
import conf.Configuration
import model.PressedPage
import play.api.libs.json.{JsError, JsSuccess, Json}
import services.SecureS3Request

import scala.concurrent.Future

trait FrontJsonFapi extends Logging with ExecutionContexts {
  val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String

  private def getAddressForPath(path: String): String = s"$bucketLocation/${path.replaceAll("""\+""","%2B")}/fapi/pressed.json"

  private def parsePressedJson(j: String): Option[PressedPage] = {
    val json = Json.parse(j)
    json.validate[PressedPage] match {
      case JsSuccess(page, _) => Option(page)
      case JsError(errors) =>
        log.warn("Could not parse JSON in FrontJson")
        None
    }
  }

  def get(path: String): Future[Option[PressedPage]] = {
    val response = SecureS3Request.urlGet(getAddressForPath(path)).get()
    response.map { r =>
      r.status match {
        case 200 => parsePressedJson(r.body)
        case 403 =>
          S3Metrics.S3AuthorizationError.increment()
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
}

object FrontJsonFapiLive extends FrontJsonFapi {
  val bucketLocation: String = s"$stage/frontsapi/pressed/live"
}
