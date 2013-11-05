package idapiclient

import client.{Auth, Parameters}
import java.net.URLEncoder


case class EmailPassword(email: String, password: String) extends Auth {
  override def parameters: Parameters = List(("email", email), ("password", password))
}

case class UserToken(userAccessToken: String) extends Auth {
  override def parameters: Parameters = List(("accessToken", userAccessToken))
}

case class UserCookie(cookieValue: String) extends Auth {
  override def parameters: Parameters = Iterable.empty
  override def headers: Parameters = List(("X-GU-ID-FOWARDED-SC-GU-U", cookieValue))
}

case class UserTokenExchange(userAccessToken: String, clientId: String) extends Auth {
  override def parameters: Parameters = List(("user-access-token", userAccessToken), ("target-client-id", clientId))
}

abstract class SocialAccessToken(parameterName: String, accessToken: String) extends Auth {
  override def parameters: Parameters = List((parameterName, accessToken))
}
case class FacebookToken(accessToken: String) extends SocialAccessToken("facebook-access-token", accessToken)

case class GoogleToken(accessToken: String) extends SocialAccessToken("google-access-token", accessToken)

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
