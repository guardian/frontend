package services

import java.net.URI

import com.google.inject.Inject
import conf.IdentityConfiguration
import play.api.mvc.RequestHeader
import utils.SafeLogging
import scala.util.Try

class ReturnUrlVerifier @Inject()(conf: IdentityConfiguration) extends SafeLogging {

  private val returnUrlDomains = List(conf.id.domain)

  val defaultReturnUrl = "http://www." + conf.id.domain

  def getVerifiedReturnUrl(request: RequestHeader): Option[String] = getVerifiedReturnUrl(
    request
      .getQueryString("returnUrl")
      .orElse(request.headers.get("Referer")
      .filterNot(_.startsWith(conf.id.url))
    )
  )

  def getVerifiedReturnUrl(returnUrl: Option[String]): Option[String] = {
    returnUrl.flatMap(getVerifiedReturnUrl)
  }

  def getVerifiedReturnUrl(returnUrl: String): Option[String] = if (hasVerifiedReturnUrl(returnUrl)) {
    Some(returnUrl)
  } else {
      logger.warn("Invalid returnURL: %s".format(returnUrl))
      None
  }

  def hasVerifiedReturnUrl(returnUrl: String): Boolean = Try(new URI(returnUrl).getHost)
    .map(isValidDomain).getOrElse(false)

  private def isValidDomain(domain: String) = returnUrlDomains.exists(validDomain =>
    domain == validDomain || domain.endsWith("." + validDomain)
  )
}
