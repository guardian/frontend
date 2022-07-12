package services.newsletters

import com.typesafe.scalalogging.LazyLogging
import conf.Configuration
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}
import utils.RemoteAddress

import scala.concurrent.Future

class GoogleRecaptchaValidationService(wsClient: WSClient) extends LazyLogging with RemoteAddress {
  def submit(token: String): Future[WSResponse] = {
    val url = "https://www.google.com/recaptcha/api/siteverify"
    val payload = Map("response" -> Seq(token), "secret" -> Seq(Configuration.google.googleRecaptchaSecret))
    wsClient
      .url(url)
      .post(payload)
  }
}

case class GoogleResponse(success: Boolean, `error-codes`: Option[Seq[String]])

object GoogleResponse {
  implicit val googleResponseReads = Json.reads[GoogleResponse]
}
