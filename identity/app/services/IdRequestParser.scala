package services

import idapiclient.OmnitureTracking
import play.api.mvc.{AnyContent, Request}
import com.google.inject.Inject
import utils.RemoteAddress

class IdRequestParser @Inject()(returnUrlVerifier: ReturnUrlVerifier) extends RemoteAddress {
  def apply(request: Request[AnyContent]) = {
    val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request)
    val ip = clientIp(request)
    IdentityRequest(
      OmnitureTracking(
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

case class IdentityRequest(omnitureData: OmnitureTracking, returnUrl: Option[String], clientIp: Option[String])
