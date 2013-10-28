package services

import idapiclient.TrackingData
import play.api.mvc.RequestHeader
import com.google.inject.{Inject, Singleton}
import utils.RemoteAddress

@Singleton
class IdRequestParser @Inject()(returnUrlVerifier: ReturnUrlVerifier) extends RemoteAddress {
  def apply(request: RequestHeader) = {
    val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request)
    val ip = clientIp(request)
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
      ip
    )
  }
}

case class IdentityRequest(trackingData: TrackingData, returnUrl: Option[String], clientIp: Option[String])
