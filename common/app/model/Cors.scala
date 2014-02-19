package model

import play.api.mvc.{RequestHeader, SimpleResult, Results}
import play.api.mvc.SimpleResult
import conf.Configuration.ajax._


object Cors extends Results {
  def apply(result: SimpleResult)(implicit request: RequestHeader): SimpleResult = {
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
