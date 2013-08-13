package services

import play.api.mvc.{AnyContent, Request}
import conf.IdentityConfiguration
import com.google.inject.Inject
import common.Logging


class ReturnUrlVerifier @Inject()(conf: IdentityConfiguration) extends Logging {
  val domainRegExp = """^https?://([^:/\?]+).*""".r
  val returnUrlDomains = List(conf.id.domain)
  val defaultReturnUrl = "http://www." + conf.id.domain

  def getVerifiedReturnUrl(request: Request[AnyContent]): Option[String] = {
    getVerifiedReturnUrl(request.queryString.get("returnUrl").flatMap(_.headOption))
  }

  def getVerifiedReturnUrl(returnUrl: Option[String]): Option[String] = {
    returnUrl.flatMap(getVerifiedReturnUrl)
  }

  def getVerifiedReturnUrl(returnUrl: String): Option[String] = {
    hasVerifiedReturnUrl(returnUrl) match {
      case true => Some(returnUrl)
      case false => {
        log.warn("Invalid returnURL: %s".format(returnUrl))
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
