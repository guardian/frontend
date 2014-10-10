package idapiclient

import client.{Auth, Parameters}
import java.net.URLEncoder

case class EmailPassword(email: String, password: String, ipOpt: Option[String]) extends Auth {
  override def parameters: Parameters = List(
    "email" -> email,
    "password" -> password
  ) ++ (ipOpt map { "ip" -> _ })
}

case class UserCookie(cookieValue: String) extends Auth {
  override def parameters: Parameters = Iterable.empty
  override def headers: Parameters = List(("X-GU-ID-FOWARDED-SC-GU-U", cookieValue))
}

case class ClientAuth(clientAccessToken: String) extends Auth {
  override def headers: Parameters = List("X-GU-ID-Client-Access-Token" -> s"Bearer $clientAccessToken")
}

class ScGuU(scGuUValue: String) extends Auth {
  override def headers: client.Parameters = Iterable("X-GU-ID-FOWARDED-SC-GU-U" -> scGuUValue)
}

case class TrackingData(returnUrl:Option[String], registrationType: Option[String], omnitureSVi: Option[String],
                            ipAddress: Option[String], referrer: Option[String], userAgent: Option[String]) {
  def parameters: Parameters = List(
    returnUrl.map("trackingReturnUrl" -> _),
    registrationType.map("trackingRegistrationType" -> _),
    omnitureSVi.map("trackingOmnitureSVI" -> _),
    ipAddress.map("trackingIpAddress" -> _),
    referrer.map("trackingReferer" -> _),
    userAgent.map("trackingUserAgent" -> _)
  ).flatten
}
