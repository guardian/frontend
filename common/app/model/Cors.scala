package model

import conf.Configuration.ajax
import play.api.mvc.{RequestHeader, Results}
import play.api.mvc.Result

object Cors extends Results with implicits.Requests {

  private val defaultAllowHeaders = List("X-Requested-With","Origin","Accept","Content-Type")

  def apply(result: Result, allowedMethods: Option[String] = None, fallbackAllowOrigin: Option[String] = None)(implicit request: RequestHeader): Result = {

    val responseHeaders = (defaultAllowHeaders ++ request.headers.get("Access-Control-Request-Headers").toList) mkString ","

    request.headers.get("Origin") match {
      case None => result
      case Some(requestOrigin) =>
        val allowedOrigin = ajax.corsOrigins.find(_ == requestOrigin).orElse(fallbackAllowOrigin)

        allowedOrigin match {
          case Some(origin) =>
            val headers = allowedMethods.map("Access-Control-Allow-Methods" -> _).toList ++ List(
              "Access-Control-Allow-Origin" -> origin,
              "Access-Control-Allow-Headers" -> responseHeaders,
              "Access-Control-Allow-Credentials" -> "true")

            result.withHeaders(headers: _*)
          case None => Forbidden("Unsupported CORS origin")
        }
    }
  }
}
