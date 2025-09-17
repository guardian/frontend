package services.newsletters

import com.typesafe.scalalogging.LazyLogging
import conf.Configuration
import play.api.libs.json.{Json, Reads}
import play.api.libs.ws.{WSClient, WSResponse}
import utils.RemoteAddress

import scala.concurrent.Future

class GoogleRecaptchaValidationService(wsClient: WSClient) extends LazyLogging with RemoteAddress {
  def submit(token: String, shouldUseVisibleKey: Boolean = false): Future[WSResponse] = {
    val url = "https://www.google.com/recaptcha/api/siteverify"
    val secret = if (shouldUseVisibleKey) {
      Configuration.google.googleRecaptchaSecretVisible
    } else {
      Configuration.google.googleRecaptchaSecret
    }
    val payload = Map("response" -> Seq(token), "secret" -> Seq(secret))
    wsClient
      .url(url)
      .post(payload)
  }
}

case class GoogleResponse(success: Boolean, `error-codes`: Option[Seq[String]])

object GoogleResponse {
  implicit val googleResponseReads: Reads[GoogleResponse] = Json.reads[GoogleResponse]
}
