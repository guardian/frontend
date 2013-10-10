package model

import common.ManifestData
import com.gu.openplatform.contentapi.model.Asset
import conf.Configuration

trait MetaData {
  def id: String
  def section: String
  def webTitle: String
  def analyticsName: String
  def url: String  = s"/$id"
  def linkText: String = webTitle

  // this is here so it can be included in analytics.
  // Basically it helps us understand the impact of changes and needs
  // to be an integral part of each page
  def buildNumber: String = ManifestData.build

  //must be one of... http://schema.org/docs/schemas.html
  def schemaType: Option[String] = None

  def metaData: Map[String, Any] = Map(
    "page-id" -> id,
    "section" -> section,
    "web-title" -> webTitle,
    "build-number" -> buildNumber,
    "analytics-name" -> analyticsName,
    "blockAds" -> false
  )

  def openGraph: List[(String, Any)] = List(
    "og:site_name" -> "the Guardian",
    "fb:app_id"    -> Configuration.facebook.appId
  )
  
  def cards: List[(String, Any)] = List(
    "twitter:site" -> "@guardian",
    "twitter:card" -> "summary",
    "twitter:app:name:iphone" -> "The Guardian",
    "twitter:app:id:iphone" -> "409128287",
    "twitter:app:name:googleplay" -> "The Guardian",
    "twitter:app:id:googleplay" -> "com.guardian",
    "twitter:app:url:googleplay" -> "http://".replace("http", "guardian")
  )

  def cacheSeconds = 60
}

trait AritcleMetaData {

}
class Page(
  val id: String,
  val section: String,
  val webTitle: String,
  val analyticsName: String) extends MetaData

object Page {
  def apply(
    id: String,
    section: String,
    webTitle: String,
    analyticsName: String) = new Page(id, section, webTitle, analyticsName)
}

trait Elements {

  // Find any crop which matches this width.
  def imageOfWidth(width: Int): Option[ImageAsset] = crops.filter(_.width == width).headOption.orElse(mainPicture)

  // Find a main picture crop which matches this width.
  def mainPicture(width: Int): Option[ImageAsset] = mainImageElement.flatMap(_.imageCrops.filter(_.width == width).headOption)
                                                    .headOption.orElse(mainPicture)
  def images: List[ImageElement]
  def videos: List[VideoElement]
  def thumbnail: Option[ImageElement]
  def mainPicture: Option[ImageAsset]
  def mainVideo: Option[VideoElement]

  private lazy val imageElements: List[ImageContainer] = (images ++ videos).sortBy(_.index)
  // Find the the lowest index imageContainer.
  private lazy val mainImageElement: Option[ImageContainer] = imageElements.find(!_.largestImage.isEmpty)
  private lazy val crops: List[ImageAsset] = imageElements.flatMap(_.imageCrops)
  lazy val videoAssets: List[VideoAsset] = videos.flatMap(_.videoAssets)

  // Return the biggest main picture crop.
  lazy val largestMainPicture: Option[ImageAsset] = mainImageElement.flatMap(_.largestImage)
  lazy val largestCrops: List[ImageAsset] = imageElements.flatMap(_.largestImage)
}

trait Tags {
  def tags: Seq[Tag] = Nil

  private def tagsOfType(tagType: String): Seq[Tag] = tags.filter(_.tagType == tagType)

  lazy val keywords: Seq[Tag] = tagsOfType("keyword")
  lazy val contributors: Seq[Tag] = tagsOfType("contributor")
  lazy val series: Seq[Tag] = tagsOfType("series")
  lazy val blogs: Seq[Tag] = tagsOfType("blog")
  lazy val tones: Seq[Tag] = tagsOfType("tone")
  lazy val types: Seq[Tag] = tagsOfType("type")
}
