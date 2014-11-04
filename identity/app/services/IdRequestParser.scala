package services

import idapiclient.TrackingData
import play.api.mvc.RequestHeader
import com.google.inject.{Inject, Singleton}
import utils.RemoteAddress
import jobs.TorExitNodeList

@Singleton
class IdRequestParser @Inject()(returnUrlVerifier: ReturnUrlVerifier) extends RemoteAddress {
  def apply(request: RequestHeader): IdentityRequest = {
    val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request)
    val ip = clientIp(request)
    val skipConfirmation = request.getQueryString("skipConfirmation").map(_ == "true")
    IdentityRequest(
      TrackingData(
        returnUrl,
        request.getQueryString("type"),
        request.cookies.get("S_VI").map(_.value),
        ip,
        request.headers.get("Referer"),
        request.headers.get("User-Agent")
      ),
      returnUrl,
      ip,
      skipConfirmation
    )
  }
}

@Singleton
class TorNodeLoggingIdRequestParser @Inject()(returnUrlVerifier: ReturnUrlVerifier) extends IdRequestParser(returnUrlVerifier)  {
  private val emailKey = "user.primaryEmailAddress"

  //I don't really like having to pass the email as a param here,
  // but Dave infosec is adamant about needing it into the logs and I can't find a way of getting hold of the form data vi the RequestHeader Object
  def apply(request: RequestHeader, email: String) : IdentityRequest = {

    clientIp(request) match {
      case Some(ip) => {
        if (request.method == "POST" && TorExitNodeList.getTorExitNodes.contains(ip)) {
          log.info(s"Attempted registration from know tor exit node: $ip email: $email")
        }
      }
      case _ =>
    }
    super.apply(request)
  }
}

case class IdentityRequest(trackingData: TrackingData, returnUrl: Option[String], clientIp: Option[String], skipConfirmation: Option[Boolean])
