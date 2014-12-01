package model

import play.api.mvc.{RequestHeader, Result, Results}
import play.api.mvc.Result
import conf.Configuration.ajax._


object Cors extends Results {
  def apply(result: Result)(implicit request: RequestHeader): Result = {
    request.headers.get("Origin") match {
      case None => result
      case Some(requestOrigin) =>
        result.withHeaders(
          "Access-Control-Allow-Origin" -> corsOrigins.find(_ == requestOrigin).getOrElse("*"),
          "Access-Control-Allow-Credentials" -> "true"
        )
    }
  }
}
