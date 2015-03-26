package services

import java.net.{URL, URLEncoder}

import common.{BadConfigurationException, ExecutionContexts, Logging}
import conf.Configuration._
import layout.{Breakpoint, Desktop, Mobile, Tablet}
import model.commercial._
import model.{ArticleType, ContentType, SectionFrontType}
import play.api.Play.current
import play.api.libs.json._
import play.api.libs.ws.WS

import scala.concurrent.Future

object OphanApi extends ExecutionContexts with Logging with implicits.WSRequests {

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
        WS.url(url) withRequestTimeout ophanApi.timeout getOKResponse() map (_.json)
      }

    maybeJson getOrElse {
      Future.failed(new BadConfigurationException("Ophan host or key not configured"))
    }
  }

  def UrlToContentPath(url: String): String = {
    var contentId = new URL(url).getPath
    if (contentId.startsWith("/")) {
      contentId = contentId.substring(1)
    }
    contentId
  }


  private def getBreakdown = getBody("breakdown") _

  def getBreakdown(platform: String, hours: Int): Future[JsValue] =
    getBreakdown(Map("platform" -> platform, "hours" -> hours.toString))

  def getBreakdown(path: String): Future[JsValue] = getBreakdown(Map("path" -> s"/$path"))


  private def getMostRead = getBody("mostread") _

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

  def getAdImpressionCount(adSlot: AdSlot,
                           breakpoint: Breakpoint,
                           country: String,
                           contentType: ContentType): Future[Int] = {

    val ophanAdSlot = adSlot match {
      case TopAboveNav => "dfp-ad--top-above-nav"
      case Top => "dfp-top"
      case Right => "dfp-right"
      case Inline1 => "dfp-ad--inline1"
      case Inline2 => "dfp-ad--inline2"
      case Inline3 => "dfp-ad--inline3"
      case _ => throw new IllegalArgumentException(s"No such ad slot: $adSlot")
    }

    val ophanDevice = breakpoint match {
      case Mobile => "Smartphone"
      case Tablet => "Tablet"
      case Desktop => "Personal computer"
      case _ => throw new IllegalArgumentException(s"No such breakpoint: $breakpoint")
    }

    val ophanContentType = contentType match {
      case ArticleType => "article"
      case SectionFrontType => "section"
      case _ => throw new IllegalArgumentException(s"No such content type: $contentType")
    }

    val params: Map[String, String] = Map(
      "mins" -> "3",
      "ad-slot" -> ophanAdSlot,
      "device" -> ophanDevice,
      "country" -> country,
      "content-type" -> ophanContentType
    )

    getBody("ads/count")(params) map {
      case JsNumber(count) => count.toInt
      case other =>
        val msg = s"Unexpected ad impression count response: $other"
        log.error(msg)
        throw new RuntimeException(msg)
    }
  }
}
