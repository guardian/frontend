package model

import conf.Configuration.{amp, ajax}
import play.api.mvc.{RequestHeader, Results}
import play.api.mvc.Result

object Cors extends Results with implicits.Requests {

  private val defaultAllowHeaders = List("X-Requested-With","Origin","Accept","Content-Type")

  def apply(result: Result, allowedMethods: Option[String] = None)(implicit request: RequestHeader): Result = {

    val responseHeaders = (defaultAllowHeaders ++ request.headers.get("Access-Control-Request-Headers").toList) mkString ","
    val corsOrigins = if(request.isAmp) amp.corsOrigins else ajax.corsOrigins

    request.headers.get("Origin") match {
      case None => result
      case Some(requestOrigin) => {
        val allowedOrigin = corsOrigins.find(_ == requestOrigin).getOrElse("*")
        val headers = allowedMethods.map("Access-Control-Allow-Methods" -> _).toList ++ List(
          "Access-Control-Allow-Origin" -> allowedOrigin,
          "Access-Control-Allow-Headers" -> responseHeaders,
          "Access-Control-Allow-Credentials" -> "true")

        result.withHeaders(headers: _*)
      }
    }
  }
}
