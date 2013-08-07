package services

import idapiclient.OmnitureTracking
import play.api.mvc.{AnyContent, Request}
import com.google.inject.Inject

class IdRequestParser @Inject()(geoHeaderParser: GeoLocationHttpHeaderParser) {
  def apply(request: Request[AnyContent]) = {
    IdentityRequest(
      OmnitureTracking(
        request.getQueryString("returnUrl"),
        request.getQueryString("type"),
        request.cookies.get("S_VI").map(_.value),
        geoHeaderParser(request).ipAddress,
        request.headers.get("Referer"),
        request.headers.get("User-Agent")
      )
    )
  }
}

case class IdentityRequest(omnitureData: OmnitureTracking)