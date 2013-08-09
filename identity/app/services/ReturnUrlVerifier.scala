package services

import play.api.mvc.{AnyContent, Request}
import conf.IdentityConfiguration
import com.google.inject.Inject
import common.Logging


class ReturnUrlVerifier @Inject()(conf: IdentityConfiguration) extends Logging {
  val domainRegExp = """^https?://([^:/\?]+).*""".r
  val returnUrlDomains = List(conf.id.domain)
  val defaultReturnUrl = "http://www." + conf.id.domain

  def getVerifiedReturnUrl(request: Request[AnyContent]): String = {
    getVerifiedReturnUrl(request.queryString.get("returnUrl").flatMap(_.headOption))
  }

  def getVerifiedReturnUrl(returnUrl: Option[String]): String = {
    returnUrl.map(getVerifiedReturnUrl).getOrElse(defaultReturnUrl)
  }

  def getVerifiedReturnUrl(returnUrl: String): String = {
    hasVerifiedReturnUrl(returnUrl) match {
      case true => returnUrl
      case false => {
        log.warn("Invalid returnURL: %s".format(returnUrl))
        defaultReturnUrl
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
