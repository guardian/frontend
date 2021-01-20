package services

import conf.IdConfig
import java.net.URLEncoder

class IdentityUrlBuilder(conf: IdConfig) {

  def queryParams(idRequest: IdentityRequest): List[(String, String)] = {
    val params = List(
      "returnUrl" -> idRequest.returnUrl,
      "group" -> idRequest.groupCode,
      "type" -> idRequest.trackingData.registrationType,
      "skipConfirmation" -> idRequest.skipConfirmation.map(_.toString),
      "page" -> idRequest.page.map(_.toString),
      "INTCMP" -> idRequest.campaignCode.map(_.toString),
    )
    params.flatMap(param => if (param._2.isDefined) Some(param._1 -> param._2.get) else None)
  }

  // Utility function to map Play's modelling of query parameters,
  // to how query parameters are modelled in this class.
  def flattenQueryParams(params: Map[String, Seq[String]]): List[(String, String)] =
    params.foldLeft(List.empty[(String, String)]) {
      case (acc, (key, values)) =>
        acc ++ values.map(key -> _)
    }

  def appendQueryParams(url: String, params: List[(String, String)]): String = {
    val separator = if (url.contains("?")) "&" else "?"
    url + {
      if (params.isEmpty) ""
      else
        params
          .map {
            case (k, v) => URLEncoder.encode(k, "UTF-8") + "=" + URLEncoder.encode(v, "UTF-8")
          }
          .mkString(separator, "&", "")
    }
  }

  def mergeQueryParams(
      paramsFromRequest: List[(String, String)],
      additionalParams: List[(String, String)],
  ): List[(String, String)] = {
    (paramsFromRequest.map(p => p._1 -> p._2).toMap ++ additionalParams.map(p => p._1 -> p._2).toMap)
      .map(p => (p._1, p._2))
      .toList
  }

  private def build(
      base: String,
      path: String,
      idRequest: Option[IdentityRequest],
      params: Seq[(String, String)] = Seq.empty,
  ) =
    appendQueryParams(base + path, mergeQueryParams(idRequest.map(queryParams).getOrElse(Nil), params.toList))

  def buildUrl(path: String, idRequest: IdentityRequest, params: (String, String)*): String =
    build(conf.url, path, Some(idRequest), params)
  def buildUrl(path: String, params: (String, String)*): String =
    build(conf.url, path, None, params)
  def buildOAuthUrl(path: String, idRequest: IdentityRequest, params: Seq[(String, String)]): String =
    build(conf.oauthUrl, path, Some(idRequest), params)
  def buildOAuthUrl(path: String, params: (String, String)*): String =
    build(conf.oauthUrl, path, None, params)
}
