package services

import idapiclient.OmnitureTracking
import play.api.mvc.{AnyContent, Request}
import com.google.inject.Inject

class IdRequestParser @Inject()(geoHeaderParser: GeoLocationHttpHeaderParser, returnUrlVerifier: ReturnUrlVerifier) {
  def apply(request: Request[AnyContent]) = {
    val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request)
    IdentityRequest(
      OmnitureTracking(
        returnUrl,
        request.getQueryString("type"),
        request.cookies.get("S_VI").map(_.value),
        geoHeaderParser(request).ipAddress,
        request.headers.get("Referer"),
        request.headers.get("User-Agent")
      ),
      returnUrl
    )
  }
}

case class IdentityRequest(omnitureData: OmnitureTracking, returnUrl: Option[String])
