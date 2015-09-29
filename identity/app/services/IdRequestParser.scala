package services

import idapiclient.TrackingData
import play.api.mvc.RequestHeader
import com.google.inject.{Inject, Singleton}
import utils.{ThirdPartyConditions, RemoteAddress}
import jobs.TorExitNodeList
import conf.switches.Switches

@Singleton
class IdRequestParser @Inject()(returnUrlVerifier: ReturnUrlVerifier) extends RemoteAddress {
  def apply(request: RequestHeader): IdentityRequest = {

    val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request)
    val groupCode = ThirdPartyConditions.validGroupCode(ThirdPartyConditions.thirdPartyConditions, request.getQueryString("group"))
    val ip = clientIp(request)

    IdentityRequest(
      trackingData = TrackingData(
        returnUrl = returnUrl,
        registrationType = request.getQueryString("type"),
        omnitureSVi =  request.cookies.get("S_VI").map(_.value),
        ipAddress = ip,
        referrer =  request.headers.get("Referer"),
        userAgent = request.headers.get("User-Agent")
      ),
      returnUrl = returnUrl,
      groupCode = groupCode,
      clientIp = ip,
      skipConfirmation =  request.getQueryString("skipConfirmation").map(_ == "true"),
      skipThirdPartyLandingPage = request.getQueryString("skipThirdPartyLandingPage").map(_ == "true").getOrElse(false),
      shortUrl = request.getQueryString("shortUrl"),
      articleId = request.getQueryString("articleId"),
      page = request.getQueryString("page").map(_.toInt),
      platform = request.getQueryString("platform")
    )
  }
}

@Singleton
class TorNodeLoggingIdRequestParser @Inject()(returnUrlVerifier: ReturnUrlVerifier) extends IdRequestParser(returnUrlVerifier)  {

  def apply(request: RequestHeader, email: String) : IdentityRequest = {

    clientIp(request) match {
      case Some(ip) => {
        if (Switches.IdentityLogRegistrationsFromTor.isSwitchedOn && TorExitNodeList.getTorExitNodes.contains(ip)) {
          log.info(s"Attempted registration from know tor exit node: $ip email: $email")
        }
      }
      case _ =>
    }
    super.apply(request)
  }
}

case class IdentityRequest(
  trackingData: TrackingData,
  returnUrl: Option[String],
  groupCode: Option[String],
  clientIp: Option[String],
  skipConfirmation: Option[Boolean],
  skipThirdPartyLandingPage: Boolean,
  shortUrl: Option[String] = None,
  articleId: Option[String] = None,
  page: Option[Int] = None,
  platform: Option[String] = None)
