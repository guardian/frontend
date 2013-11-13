package services

import scala.concurrent.Future
import play.api.libs.json._
import conf.Configuration._
import common.{ExecutionContexts, Logging}
import play.api.libs.ws.WS


object OphanApi extends ExecutionContexts with Logging {

  private def getBody(path: String): Future[String] = {
    (for {
      host <- ophanApi.host
      key <- ophanApi.key
    } yield {
      val url = s"$host/$path&api-key=$key"
      log.info("Making request to Ophan API: " + url)
      WS.url(url) withRequestTimeout ophanApi.timeout get() map (_.body)
    }) getOrElse {
      log.error("Ophan host or key not configured")
      Future("{}")
    }
  }

  private def getBodyAsJson(path: String): Future[JsValue] = {
    for (body <- getBody(path)) yield Json.parse(body)
  }

  def getBreakdown(platform: String, hours: Int): Future[String] = {
    getBody(s"breakdown?platform=$platform&hours=$hours")
  }

  def getBreakdown(path: String): Future[String] = {
    getBody(s"breakdown?path=/$path")
  }

  def getMostRead(referrer: String, hours: Int): Future[JsValue] = {
    getBodyAsJson(s"mostread?referrer=$referrer&hours=$hours")
  }

  def getMostRead(hours: Int, count: Int): Future[JsValue] = {
    getBodyAsJson(s"mostread?hours=$hours&count=$count")
  }

  def getMostPopularOnward(path: String, hours: Int, count: Int, isContent: Boolean): Future[JsValue] = {
    getBodyAsJson(s"onward?path=/$path&is-content=true&hours=3&count=10")
  }
}
