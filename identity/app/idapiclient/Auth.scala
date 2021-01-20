package idapiclient

trait Auth {
  def parameters: Parameters = Iterable.empty
  def headers: Parameters = Iterable.empty
}

object Anonymous extends Auth

case class EmailPassword(email: String, password: String, ipOpt: Option[String]) extends Auth {
  override def parameters: Parameters =
    List(
      "email" -> email,
      "password" -> password,
    ) ++ (ipOpt map { "ip" -> _ })
}

case class UserCookie(cookieValue: String) extends Auth {
  override def parameters: Parameters = Iterable.empty
  override def headers: Parameters = List(("X-GU-ID-FOWARDED-SC-GU-U", cookieValue))
}

case class ClientAuth(clientAccessToken: String) extends Auth {
  override def headers: Parameters = List("X-GU-ID-Client-Access-Token" -> s"Bearer $clientAccessToken")
}

case class ScGuU(scGuUValue: String) extends Auth {
  override def headers: Parameters = Iterable("X-GU-ID-FOWARDED-SC-GU-U" -> scGuUValue)
}

case class ScGuRp(scGuRpValue: String) extends Auth {
  override def headers: Parameters = Iterable("X-GU-ID-FOWARDED-SC-GU-RP" -> scGuRpValue)
}

case class TrackingData(
    returnUrl: Option[String],
    registrationType: Option[String],
    omnitureSVi: Option[String],
    ipAddress: Option[String],
    referrer: Option[String],
    userAgent: Option[String],
) {
  def parameters: Parameters =
    List(
      returnUrl.map("trackingReturnUrl" -> _),
      registrationType.map("trackingRegistrationType" -> _),
      omnitureSVi.map("trackingOmnitureSVI" -> _),
      ipAddress.map("trackingIpAddress" -> _),
      referrer.map("trackingReferer" -> _),
      userAgent.map("trackingUserAgent" -> _),
    ).flatten
}
