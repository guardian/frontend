package services

import scala.concurrent.Future
import play.api.libs.json._
import conf.Configuration._
import common.{ExecutionContexts, Logging}
import play.api.libs.ws.WS


object OphanApi extends ExecutionContexts with Logging {

  private def getAsString(path: String): Future[String] = {
    val url = "%s/%s&api-key=%s" format(ophanApi.host, path, ophanApi.key)
    log.info("Making request to Ophan API: " + url)
    WS.url(url) withRequestTimeout ophanApi.timeout get() map (_.body)
  }

  private def getAsJson(path: String): Future[JsValue] = {
    getAsString(path) map (jsonString => Json.parse(jsonString))
  }

  def getBreakdown(platform: String, hours: Int): Future[String] = {
    getAsString("breakdown?platform=%s&hours=%d" format(platform, hours))
  }

  def getBreakdown(path: String): Future[String] = {
    getAsString("breakdown?path=/%s" format path)
  }

  def getMostRead(referrer: String, hours: Int): Future[JsValue] = {
    getAsJson("mostread?referrer=%s&hours=%d" format(referrer, hours))
  }

}
