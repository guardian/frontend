package model.diagnostics

import conf._
import common._
import play.api.libs.json._
import play.api.libs.ws.{WS, Response}
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.{Future}

object AirBrake extends Logging {

  def send(category: String, message: String, file: String = "undefined", lineno: Integer = 0, backtrace: String = "undefined") = {

    val url = Configuration.airbrake.url 
    val user = Configuration.airbrake.user
    val apiKey = Configuration.airbrake.apiKey

    val body = s"""{ "notifier": { "name": "gu.diagnostics", "version": "0.1", "url": "http://theguardian.com" },
                    "errors": [ { "type": "${category}", "message": "${message}", "backtrace": [ 
                      { "file": "${file}", "line": ${lineno}, "function": "${backtrace}" } ] } ]}""" 
    
    log info s"Calling: ${url} with ${body}" 

    val futureResponse: Future[String] = WS.url(url)
      .withHeaders("Content-Type" -> "application/json")
      .withQueryString("key" -> apiKey)
      .withRequestTimeout(1000)
      .post(body).map { response =>
        val r = response.body
        log info s"Airbrake response: ${r}"
        "ok"
      }

      futureResponse
  }
}
