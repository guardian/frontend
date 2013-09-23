package model


class IdentityPage(id: String, webTitle: String, analyticsName: String)
  extends Page(id, "Users", webTitle, analyticsName) {

  override def metaData: Map[String, Any] = super.metaData + ("blockAds" -> true)
}

class IdentityRegistrationPage(id: String, webTitle: String, analyticsName: String, returnUrl: String)
  extends IdentityPage(id, webTitle, analyticsName) {

  override def metaData: Map[String, Any] = super.metaData +
    ("returnUrl" -> returnUrl,
     "content-type" -> "userid", //For the no js omniture tracking
     "registrationType" -> "basicIdentity:Anewreg::theguardian"
    )
}

class IdentityRegistrationStartPage(id: String, webTitle: String, analyticsName: String, returnUrl: String)
  extends IdentityRegistrationPage(id, webTitle, analyticsName, returnUrl) {

  override def metaData: Map[String, Any] = super.metaData + ("registrationEvent" -> "event30")
}

class IdentityRegistrationErrorPage(id: String, webTitle: String, analyticsName: String, returnUrl: String)
  extends IdentityRegistrationPage(id, webTitle, analyticsName, returnUrl) {

  override def metaData: Map[String, Any] = super.metaData + ("registrationEvent" -> "event33")
}


