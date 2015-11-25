package services

import com.google.inject.Inject
import conf.IdentityConfiguration
import java.net.URLEncoder

class IdentityUrlBuilder @Inject()(conf: IdentityConfiguration) {

  def queryParams(idRequest: IdentityRequest): List[(String, String)] = {
    val params = List(
      "returnUrl" -> idRequest.returnUrl,
      "group" -> idRequest.groupCode,
      "type" -> idRequest.trackingData.registrationType,
      "skipConfirmation" -> idRequest.skipConfirmation.map(_.toString),
      "page" -> idRequest.page.map(_.toString),
      "INTCMP" -> idRequest.campaignCode.map(_.toString)
    )
    params.flatMap(param => if (param._2.isDefined) Some(param._1 -> param._2.get) else None)
  }

  def appendQueryParams(url: String, params: List[(String, String)]): String = {
    val separator = if (url.contains("?")) "&" else "?"
    url + {
      if (params.isEmpty) ""
      else params.map {
        case (k, v) => URLEncoder.encode(k, "UTF-8") + "=" + URLEncoder.encode(v, "UTF-8")
      }.mkString(separator, "&", "")
    }
  }

  def mergeQueryParams(paramsFromRequest: List[(String, String)], additionalParams: List[(String, String)]): List[(String, String)] = {
    (paramsFromRequest.map(p => p._1 -> p._2).toMap ++ additionalParams.map(p => p._1 -> p._2).toMap).map(p => (p._1, p._2)).toList
  }

  private def build(base: String, path: String, idRequest: Option[IdentityRequest], params: Seq[(String, String)] = Seq.empty) =
    appendQueryParams(base + path, mergeQueryParams(idRequest.map(queryParams).getOrElse(Nil), params.toList))

  def buildUrl(path: String, idRequest: IdentityRequest, params: (String, String)*) =
    build(conf.id.url, path, Some(idRequest), params)
  def buildUrl(path: String, params: (String, String)*) =
    build(conf.id.url, path, None, params)
  def buildOAuthUrl(path: String, idRequest: IdentityRequest, params: (String, String)*) =
    build(conf.id.oauthUrl, path, Some(idRequest), params)
  def buildOAuthUrl(path: String, params: (String, String)*) =
    build(conf.id.oauthUrl, path, None, params)
  def buildOAuthUrl(path: String, idRequest: IdentityRequest, optionalParam: Option[(String, String)]) = {
    optionalParam match {
      case Some(param) => build(conf.id.oauthUrl, path, Some(idRequest), Seq(param))
      case _ => build(conf.id.oauthUrl, path, Some(idRequest))
    }
  }
}
