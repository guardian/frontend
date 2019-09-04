package model

import java.net.URI
import conf.Configuration.ajax
import play.api.mvc.{RequestHeader, Results}
import play.api.mvc.Result

object Cors extends Results with implicits.Requests {

  private val defaultAllowHeaders = List("X-Requested-With","Origin","Accept","Content-Type")

  def apply(result: Result, allowedMethods: Option[String] = None, fallbackAllowOrigin: Option[String] = None, extraWhitelist: Seq[String] = Nil) (implicit request: RequestHeader): Result = {

    val responseHeaders = (defaultAllowHeaders ++ request.headers.get("Access-Control-Request-Headers").toList) mkString ","

    def isWhitelisted(origin: String): Boolean = {
      val originUri = new URI(origin)
      ajax.corsOrigins.contains(origin) || extraWhitelist.exists(originUri.getHost().endsWith(_))
    }

    request.headers.get("Origin")
      .filter(isWhitelisted)
      .orElse(fallbackAllowOrigin) match {

      case Some(allowedOrigin) =>
        val headers = allowedMethods.map("Access-Control-Allow-Methods" -> _).toList ++ List(
          "Access-Control-Allow-Origin" -> allowedOrigin,
          "Access-Control-Allow-Headers" -> responseHeaders,
          "Access-Control-Allow-Credentials" -> "true")

        result.withHeaders(headers: _*)
      case None => result
    }
  }
}
