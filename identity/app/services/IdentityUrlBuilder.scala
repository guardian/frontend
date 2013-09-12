package services

import com.google.inject.Inject
import conf.IdentityConfiguration
import java.net.URLEncoder

class IdentityUrlBuilder @Inject()(conf: IdentityConfiguration) {

  def queryParams(idRequest: IdentityRequest): List[(String, String)] = {
    val params = List("returnUrl" -> idRequest.returnUrl, "type" -> idRequest.omnitureData.registrationType)
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

  def buildUrl(path: String, idRequest: IdentityRequest): String = {
    appendQueryParams(conf.id.url + path, queryParams(idRequest))
  }
}
