package model

import play.api.mvc.{RequestHeader, Results}
import play.api.mvc.Result
import conf.Configuration.ajax.corsOrigins

object Cors extends Results {
  def apply(result: Result, allowedMethods: Option[String] = None)(implicit request: RequestHeader): Result = {

    val responseHeaders = request.headers.get("Access-Control-Request-Headers").toList
      .:+("X-Requested-With").mkString(",")

    request.headers.get("Origin") match {
      case None => result
      case Some(requestOrigin) => {
        val headers = allowedMethods.map("Access-Control-Allow-Methods" -> _).toList ++ List(
          "Access-Control-Allow-Origin" -> corsOrigins.find(_ == requestOrigin).getOrElse("*"),
          "Access-Control-Allow-Headers" -> responseHeaders,
          "Access-Control-Allow-Credentials" -> "true")
        result.withHeaders(headers: _*)
      }
    }
  }
}
