package services

import play.api.mvc.RequestHeader
import conf.IdentityConfiguration
import com.google.inject.Inject
import utils.SafeLogging


class ReturnUrlVerifier @Inject()(conf: IdentityConfiguration) extends SafeLogging {
  val domainRegExp = """^https?://([^:/\?]+).*""".r
  val returnUrlDomains = List(conf.id.domain)
  val defaultReturnUrl = "http://www." + conf.id.domain

  def getVerifiedReturnUrl(request: RequestHeader): Option[String] = {
    getVerifiedReturnUrl(
      request
        .getQueryString("returnUrl")
        .orElse(request.headers.get("Referer").filterNot(_.startsWith(conf.id.url))
      )
    )
  }

  def getVerifiedReturnUrl(returnUrl: Option[String]): Option[String] = {
    returnUrl.flatMap(getVerifiedReturnUrl)
  }

  def getVerifiedReturnUrl(returnUrl: String): Option[String] = {
    hasVerifiedReturnUrl(returnUrl) match {
      case true => Some(returnUrl)
      case false => {
        logger.warn("Invalid returnURL: %s".format(returnUrl))
        None
      }
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
