package services.zug

import common.GuLogging
import conf.Configuration
import implicits.WSRequests
import play.api.libs.json.{JsError, JsObject, JsSuccess}
import play.api.libs.ws.WSClient

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

case class ZugClientError(message: String)

/** Generic client for the Zug API (e.g. election results, football matches). Responses are returned as a raw `JsObject` -
  * callers are responsible for interpreting the shape.
  */
trait ZugClient {
  def get(path: String)(implicit executionContext: ExecutionContext): Future[Either[ZugClientError, JsObject]]
}

class ZugClientImpl(wsClient: WSClient) extends ZugClient with WSRequests with GuLogging {

  override def get(
      path: String,
  )(implicit executionContext: ExecutionContext): Future[Either[ZugClientError, JsObject]] = {
    val url = s"${Configuration.zugApi.host.stripSuffix("/")}/${path.stripPrefix("/")}"
    wsClient
      .url(url)
      .withRequestTimeout(10.seconds)
      .getOKResponse()
      .map { response =>
        response.json.validate[JsObject] match {
          case JsSuccess(value, _) => Right(value)
          case JsError(errors)     => Left(ZugClientError(s"Failed to parse response from $url: $errors"))
        }
      }
      .recover { case e: Exception =>
        Left(ZugClientError(s"Request to $url failed: ${e.getMessage}"))
      }
  }
}
