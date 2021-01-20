package model

import java.net.URI
import conf.Configuration.ajax
import play.api.mvc.{RequestHeader, Results}
import play.api.mvc.Result

object Cors extends Results with implicits.Requests {

  private val defaultAllowHeaders = List("X-Requested-With", "Origin", "Accept", "Content-Type")

  def apply(
      result: Result,
      allowedMethods: Option[String] = None,
      fallbackAllowOrigin: Option[String] = None,
      domainWhitelist: Seq[String] = Nil,
  )(implicit request: RequestHeader): Result = {

    val responseHeaders =
      (defaultAllowHeaders ++ request.headers.get("Access-Control-Request-Headers").toList) mkString ","

    request.headers
      .get("Origin")
      .filter(isWhitelisted(_, ajax.corsOrigins, domainWhitelist))
      .orElse(fallbackAllowOrigin) match {

      case Some(allowedOrigin) =>
        val headers = allowedMethods.map("Access-Control-Allow-Methods" -> _).toList ++ List(
          "Access-Control-Allow-Origin" -> allowedOrigin,
          "Access-Control-Allow-Headers" -> responseHeaders,
          "Access-Control-Allow-Credentials" -> "true",
        )

        result.withHeaders(headers: _*)
      case None => result
    }
  }

  private[model] def isWhitelisted(origin: String, corsOrigins: Seq[String], extraWhitelist: Seq[String]): Boolean = {
    val originHost = new URI(origin).getHost
    corsOrigins.contains(origin) ||
    extraWhitelist.contains(originHost) ||
    extraWhitelist.exists { domain =>
      if (domain == "localhost") false
      else originHost.endsWith(s".$domain")
    }
  }
}
