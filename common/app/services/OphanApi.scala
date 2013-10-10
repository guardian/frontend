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
      val url = "%s/%s&api-key=%s" format(host, path, key)
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
    getBody("breakdown?platform=%s&hours=%d" format(platform, hours))
  }

  def getBreakdown(path: String): Future[String] = {
    getBody("breakdown?path=/%s" format path)
  }

  def getMostRead(referrer: String, hours: Int): Future[JsValue] = {
    getBodyAsJson("mostread?referrer=%s&hours=%d" format(referrer, hours))
  }

}
