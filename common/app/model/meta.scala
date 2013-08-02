package model

import common.ManifestData
import com.gu.openplatform.contentapi.model.Asset

trait MetaData {
  def id: String
  def section: String
  def webTitle: String
  def analyticsName: String

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
    "analytics-name" -> analyticsName
  )

  def cacheSeconds = 60
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
  def imageOfWidth(width: Int): Option[Image] = crops.filter(_.width == width).headOption.orElse(mainPicture)

  // Legacy trait function which can soon be removed in favour of imageOfWidth.
  def mainPicture(width: Int): Option[Image] = imageOfWidth(width)

  def images: List[ImageElement]
  def videos: List[VideoElement]

  lazy val videoAssets: List[Asset] = videos.flatMap(_.videoAssets)
  lazy val crops: List[Image] = images.flatMap(_.imageCrops) ++ videos.flatMap(_.videoImages)
  lazy val mainPicture: Option[Image] = crops.headOption
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
