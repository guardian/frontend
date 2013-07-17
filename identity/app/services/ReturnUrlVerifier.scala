package services

import play.api.mvc.{AnyContent, Request}


class ReturnUrlVerifier {
  val domainRegExp = """^https?://([^:/\?]+).*""".r
  val returnUrlDomains = List("theguardian.com")
  val defaultReturnUrl = "http://www.theguardian.com"

  def getVerifiedReturnUrl(request: Request[AnyContent]): String = {
    getVerifiedReturnUrl(request.queryString("returnUrl").headOption)
  }

  def getVerifiedReturnUrl(returnUrl: Option[String]): String = {
    returnUrl.map(getVerifiedReturnUrl(_)).getOrElse(defaultReturnUrl)
  }

  def getVerifiedReturnUrl(returnUrl: String): String = {
    hasVerifiedReturnUrl(returnUrl) match {
      case true => returnUrl
      case false => defaultReturnUrl
    }
  }

  def hasVerifiedReturnUrl(returnUrl: String): Boolean = {
    returnUrl match {
      case domainRegExp(domain) if returnUrlDomains.exists(validDomain =>
      {domain == validDomain || domain.endsWith("." + validDomain)}
      ) => true
      case _ =>
        false
    }
  }
}
