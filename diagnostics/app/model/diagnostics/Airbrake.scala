package model.diagnostics

import conf._
import common._
import play.api.libs.json._
import play.api.libs.ws.{WS, Response}
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.{Future}

object AirBrake extends Logging {

  def lg = {

    val url = Configuration.airbrake.url 
    val user = Configuration.airbrake.user
    val apiKey = Configuration.airbrake.apiKey
    val body = """{ "notifier": { "name": "gu.diagnostics", "version": "0.1", "url": "http://theguardian.com" }, "errors": [ { "type":      "error1", "message":   "message1", "backtrace": [ { "file": "backtrace file", "line": 10, "function": "backtrace function" } ] } ] }""" 
    
    log info s"Calling: ${url} with ${apiKey}" 

    val futureResponse: Future[String] = WS.url(url)
      .withHeaders("Content-Type" -> "application/json")
      .withQueryString("key" -> apiKey)
      .withRequestTimeout(2000)
      .post(body).map { response =>
        val r = response.body
        log info s"Airbrake response: ${r}"
        "ok"
      }

      futureResponse
  }
}
