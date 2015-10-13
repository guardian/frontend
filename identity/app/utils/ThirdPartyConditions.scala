package utils

import java.net.URI

import services.{IdentityUrlBuilder, IdentityRequest}

import scala.util.{Success, Try}

object ThirdPartyConditions {

  lazy val thirdPartyConditions: Seq[String] = Seq(
    "GRS",
    "GTNF"
  )

  def validGroupCode(conditions: Seq[String], groupCode: Option[String]): Option[String] = conditions.find(g => g == groupCode.getOrElse(""))

  def extractGroupCode(url: String): Option[String] = {
    Try(new URI(url)) match {
      case Success(uri) => Option(uri.getPath.split("/").last)
      case _ => None
    }
  }

  def agreeUrl(groupCode: String): String = {
    s"/agree/${groupCode}"
  }

  def agreeUrlOpt(idRequest: IdentityRequest, idUrlBuilder: IdentityUrlBuilder): Option[String] = {
    idRequest.groupCode match {
      case Some(groupCode) => Some(idUrlBuilder.buildUrl(agreeUrl(groupCode), idRequest.copy(groupCode = None), ("skipThirdPartyLandingPage", "true")))
      case _ => None
    }
  }

  def agreeUrlParamOpt(idRequest: IdentityRequest, idUrlBuilder: IdentityUrlBuilder): Option[(String, String)] = {
    agreeUrlOpt(idRequest, idUrlBuilder) match {
      case Some(returnUrl) => Some(("returnUrl", returnUrl))
      case _ => None
    }
  }

}
