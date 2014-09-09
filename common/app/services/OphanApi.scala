package services

import scala.concurrent.Future
import play.api.libs.json._
import conf.Configuration._
import common.{ExecutionContexts, Logging}
import play.api.libs.ws.WS
import java.net.URL
import play.api.Play.current

object OphanApi extends ExecutionContexts with Logging {

  private def getBody(path: String, timeout: Int = ophanApi.timeout): Future[JsValue] = {
    (for {
      host <- ophanApi.host
      key <- ophanApi.key
    } yield {
      val url = s"$host/$path&api-key=$key"
      log.info("Making request to Ophan API: " + url)
      WS.url(url) withRequestTimeout timeout get() map (_.json)
    }) getOrElse {
      log.error("Ophan host or key not configured")
      Future.successful(JsObject(Nil))
    }
  }

  def UrlToContentPath(url: String): String = {
    var contentId = new URL(url).getPath
    if (contentId.startsWith("/")) {
      contentId = contentId.substring(1)
    }
    contentId
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

  def getMostReferredFromSocialMedia(days: Int): Future[JsValue] = getBody(s"mostread?days=$days&referrer=social%20media")

  val validQueryKeys = Seq("platform", "hours", "ad-slot")

  def getAdsRenderTime(params: Map[String, Seq[String]]): Future[JsValue] = {
    val query: String = params
      .filter { case(k, v) =>
        validQueryKeys.contains(k)
      }
      .map { case (k, v) =>
        k + "=" + v.mkString(",")
      }
      .mkString("&")
    getBody(s"ads/render-time?$query", 5000)
  }

  def getSurgingContent() = getBody("surging?")

  def getMostViewedVideos(hours: Int, count: Int): Future[JsValue] = getBody(s"video/mostviewed?hours=$hours&count=$count")

  def getMostViewedGalleries(hours: Int, count: Int): Future[JsValue] = getBody(s"mostread?content-type=gallery&hours=$hours&count=$count")
}
