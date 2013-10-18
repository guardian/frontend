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
    "twitter:app:name:iphone" -> "The Guardian",
    "twitter:app:id:iphone" -> "409128287",
    "twitter:app:name:googleplay" -> "The Guardian",
    "twitter:app:id:googleplay" -> "com.guardian"
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
  /*
    Now I know you might THINK that you want to change this. The people around you might have convinced you
    that there is some magic formula. There might even be a 'Business Stakeholder' involved...

    But know this... I WILL find you, I WILL hunt you down, and you WILL be sorry.

    If you need to express a hack, express it somewhere where you are not pretending it is the Main Picture

    You probably want the TRAIL PICTURE
  */
  private lazy val mainPictureElement: Option[ImageContainer] = imageElements.find(_.isMain)


    // Find a main picture crop which matches this aspect ratio.
  def trailPicture(aspectWidth: Int, aspectHeight: Int): Option[ImageContainer] = trailPicture.flatMap{ main =>
    val correctCrop = main.imageCrops.find(image => image.aspectRatioWidth == aspectWidth && image.aspectRatioHeight == aspectHeight)
    correctCrop.map{ crop =>
      ImageContainer(Seq(crop), main.delegate)
    }
  }

  def images: List[ImageElement]
  def videos: List[VideoElement]
  def thumbnail: Option[ImageElement]

  // main picture is used on the content page (i.e. the article page or the video page)
  def mainPicture: Option[ImageContainer] = mainPictureElement
  lazy val hasMainPicture = mainPicture.nonEmpty

  // trail picture is used on index pages (i.e. Fronts and tag pages)
  def trailPicture: Option[ImageContainer] = mainPicture.orElse(thumbnail)

  def mainVideo: Option[VideoElement]

  private lazy val imageElements: List[ImageContainer] = (images ++ videos).sortBy(_.index)

  private lazy val crops: List[ImageAsset] = imageElements.flatMap(_.imageCrops)
  lazy val videoAssets: List[VideoAsset] = videos.flatMap(_.videoAssets)

  // Return the biggest main picture crop.
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
