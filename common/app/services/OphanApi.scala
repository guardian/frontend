package services

import java.net.URLEncoder

import common.{BadConfigurationException, ExecutionContexts, Logging}
import conf.Configuration._
import play.api.libs.json._
import play.api.libs.ws.WSClient

import scala.concurrent.Future
import scala.concurrent.duration.DurationInt

object MostReadItem {
  implicit val jsonReads = Json.reads[MostReadItem]
}

case class MostReadItem(url: String, count: Int)

class OphanApi(wsClient: WSClient) extends ExecutionContexts with Logging with implicits.WSRequests {

  private def getBody(path: String)(params: Map[String, String] = Map.empty): Future[JsValue] = {
    val maybeJson = for {
      host <- ophanApi.host
      key <- ophanApi.key
    } yield {
        val queryString = params map {
          case (k, v) => s"$k=${URLEncoder.encode(v, "utf-8")}"
        } mkString "&"
        val url = s"$host/$path?$queryString&api-key=$key"
        log.info(s"Making request to Ophan API: $url")
        wsClient.url(url).withRequestTimeout(10.seconds).getOKResponse().map(_.json)
      }

    maybeJson getOrElse {
      Future.failed(new BadConfigurationException("Ophan host or key not configured"))
    }
  }

  private def getBreakdown = getBody("breakdown") _

  def getBreakdown(platform: String, hours: Int): Future[JsValue] =
    getBreakdown(Map("platform" -> platform, "hours" -> hours.toString))

  def getBreakdown(path: String): Future[JsValue] = getBreakdown(Map("path" -> s"/$path"))


  private def getMostRead = getBody("mostread") _

  def getMostReadFacebook(hours: Int): Future[Seq[MostReadItem]] =
    getMostRead("Facebook", hours).map(_.as[Seq[MostReadItem]])

  def getMostReadTwitter(hours: Int): Future[Seq[MostReadItem]] =
    getMostRead("Twitter", hours).map(_.as[Seq[MostReadItem]])

  def getMostRead(referrer: String, hours: Int): Future[JsValue] =
    getMostRead(Map("referrer" -> referrer, "hours" -> hours.toString))

  def getMostRead(hours: Int, count: Int): Future[JsValue] =
    getMostRead(Map("hours" -> hours.toString, "count" -> count.toString))

  def getMostRead(hours: Int, count: Int, country: String): Future[JsValue] =
    getMostRead(Map("hours" -> hours.toString, "count" -> count.toString, "country" -> country))

  def getMostReadInSection(section: String, days: Int, count: Int): Future[JsValue] =
    getMostRead(Map("days" -> days.toString, "count" -> count.toString, "section" -> section))

  def getMostReferredFromSocialMedia(days: Int): Future[JsValue] =
    getMostRead(Map("days" -> days.toString, "referrer" -> "social media"))

  def getMostViewedGalleries(hours: Int, count: Int): Future[JsValue] =
    getMostRead(Map("content-type" -> "gallery",
      "hours" -> hours.toString,
      "count" -> count.toString))

  def getMostViewedAudio(hours: Int, count: Int): Future[JsValue] =
    getMostRead(Map("content-type" -> "audio",
      "hours" -> hours.toString,
      "count" -> count.toString))


  def getMostPopularOnward(path: String,
                           hours: Int,
                           count: Int,
                           isContent: Boolean): Future[JsValue] =
    getBody("onward")(
      Map("path" -> s"/$path",
        "is-content" -> "true",
        "hours" -> "3",
        "count" -> "10"))

  def getAdsRenderTime(params: Map[String, Seq[String]]): Future[JsValue] = {
    val validatedParams = for {
      (key, values) <- params
      if Seq("platform", "hours", "ad-slot").contains(key)
      value <- values
    } yield {
        key -> value
      }

    getBody("ads/render-time")(validatedParams)
  }

  def getSurgingContent(): Future[JsValue] = getBody("surging")()

  def getMostViewedVideos(hours: Int, count: Int): Future[JsValue] =
    getBody("video/mostviewed")(Map("hours" -> hours.toString, "count" -> count.toString))
}

