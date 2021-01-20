package services

import java.net.URI

import conf.IdConfig
import play.api.mvc.RequestHeader
import utils.SafeLogging

import scala.util.Try

class ReturnUrlVerifier(conf: IdConfig) extends SafeLogging {

  private val returnUrlDomains = List(conf.domain, "theguardian.com", "code.dev-theguardian.com", "thegulocal.com")
  private val validUris = List(new URI("sso.com.theguardian.jobs://ssologoutsuccess"))

  val defaultReturnUrl = "http://www." + conf.domain

  def getVerifiedReturnUrl(request: RequestHeader): Option[String] =
    getVerifiedReturnUrl(
      request
        .getQueryString("returnUrl")
        .orElse(
          request.headers
            .get("Referer")
            .filterNot(_.startsWith(conf.url)),
        ),
    )

  def getVerifiedReturnUrl(returnUrl: Option[String]): Option[String] = {
    returnUrl.flatMap(getVerifiedReturnUrl)
  }

  def getVerifiedReturnUrl(returnUrl: String): Option[String] =
    if (hasVerifiedReturnUrl(returnUrl)) {
      Some(returnUrl)
    } else {
      logger.warn("Invalid returnURL: %s".format(returnUrl))
      None
    }

  def hasVerifiedReturnUrl(returnUrl: String): Boolean =
    Try(new URI(returnUrl).getHost)
      .map(uri => validUris.contains(uri) || isValidDomain(uri))
      .getOrElse(false)

  private def isValidDomain(domain: String) =
    returnUrlDomains.exists(validDomain => domain == validDomain || domain.endsWith("." + validDomain))
}
