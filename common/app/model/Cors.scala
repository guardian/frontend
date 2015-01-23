package model

import play.api.mvc.{RequestHeader, Results}
import play.api.mvc.Result
import conf.Configuration.ajax.corsOrigins

object Cors extends Results {

  private val defaultAllowHeaders = List("X-Requested-With","Origin","Accept","Content-Type")

  def apply(result: Result, allowedMethods: Option[String] = None)(implicit request: RequestHeader): Result = {

    val responseHeaders = (defaultAllowHeaders ++ request.headers.get("Access-Control-Request-Headers").toList) mkString ","

    val origin = if (conf.Switches.DefaultOriginSwitch.isSwitchedOn && request.headers.get("Origin").isEmpty) {
      // Not nice, but this is temporary code to investigate Cors behaviour.
      Some("")
    } else {
      request.headers.get("Origin")
    }

    origin match {
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
