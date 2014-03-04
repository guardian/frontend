package services

import scala.concurrent.Future
import play.api.libs.json._
import conf.Configuration._
import common.{ExecutionContexts, Logging}
import play.api.libs.ws.WS


object OphanApi extends ExecutionContexts with Logging {

  private def getBody(path: String): Future[JsValue] = {
    (for {
      host <- ophanApi.host
      key <- ophanApi.key
    } yield {
      val url = s"$host/$path&api-key=$key"
      log.info("Making request to Ophan API: " + url)
      WS.url(url) withRequestTimeout ophanApi.timeout get() map (_.json)
    }) getOrElse {
      log.error("Ophan host or key not configured")
      Future.successful(JsObject(Nil))
    }
  }

  def getBreakdown(platform: String, hours: Int): Future[JsValue] = getBody(s"breakdown?platform=$platform&hours=$hours")

  def getBreakdown(path: String): Future[JsValue] = getBody(s"breakdown?path=/$path")

  def getMostRead(referrer: String, hours: Int): Future[JsValue] = getBody(s"mostread?referrer=$referrer&hours=$hours")

  def getMostRead(hours: Int, count: Int): Future[JsValue] = getBody(s"mostread?hours=$hours&count=$count")

  def getMostRead(hours: Int, count: Int, country: String): Future[JsValue] = getBody(s"mostread?hours=$hours&count=$count&country=$country")

  def getMostReadInSection(section: String, days: Int, count: Int): Future[JsValue] =
    getBody(s"mostread?days=$days&count=$count&section=$section")

  def getMostPopularOnward(path: String, hours: Int, count: Int, isContent: Boolean): Future[JsValue] =
    getBody(s"onward?path=/$path&is-content=true&hours=3&count=10")

}
