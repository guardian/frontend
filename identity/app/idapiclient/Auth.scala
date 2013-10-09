package idapiclient

import client.{Auth, Parameters}


case class EmailPassword(email: String, password: String) extends Auth {
  override def parameters: Parameters = List(("email", email), ("password", password))
  override def headers: Parameters = Iterable.empty
}

case class UserToken(userAccessToken: String) extends Auth {
  override def parameters: Parameters = List(("accessToken", userAccessToken))
  override def headers: Parameters = Iterable.empty
}

case class UserCookie(cookieValue: String) extends Auth {
  override def parameters: Parameters = List(("SC_GU_U", cookieValue))
  override def headers: Parameters = Iterable.empty
}

case class UserTokenExchange(userAccessToken: String, clientId: String) extends Auth {
  override def parameters: Parameters = List(("user-access-token", userAccessToken), ("target-client-id", clientId))
  override def headers: Parameters = Iterable.empty
}

abstract class SocialAccessToken(parameterName: String, accessToken: String) extends Auth {
  override def parameters: Parameters = List((parameterName, accessToken))
  override def headers: Parameters = Iterable.empty
}
case class FacebookToken(accessToken: String) extends SocialAccessToken("facebook-access-token", accessToken)

case class GoogleToken(accessToken: String) extends SocialAccessToken("google-access-token", accessToken)

case class ClientAuth(clientAccessToken: String) extends Auth {
  def parameters: Parameters = List(("accessToken", clientAccessToken))
  override def headers: Parameters = Iterable.empty
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
