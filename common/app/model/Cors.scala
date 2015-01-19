package model

import play.api.mvc.{RequestHeader, Results}
import play.api.mvc.Result
import conf.Configuration.ajax.corsOrigins

object Cors extends Results {
  def apply(result: Result, allowedMethods: Option[String] = None)(implicit request: RequestHeader): Result = {

    val controlHeaders = List(
      allowedMethods.map("Access-Control-Allow-Methods" -> _),
      request.headers.get("Access-Control-Request-Headers").map("Access-Control-Allow-Headers" -> _)
    ).flatten

    request.headers.get("Origin") match {
      case None => result
      case Some(requestOrigin) => {
        val headers = controlHeaders ++ List(
          "Access-Control-Allow-Origin" -> corsOrigins.find(_ == requestOrigin).getOrElse("*"),
          "Access-Control-Allow-Credentials" -> "true",
          "Access-Control-Allow-Headers" -> "accept, content-type")
        result.withHeaders(headers: _*)
      }
    }
  }
}
