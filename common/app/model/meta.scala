package model

import common.{Pagination, ManifestData}
import conf.Configuration
import dfp.DfpAgent

trait MetaData extends Tags {
  def id: String
  def section: String
  def webTitle: String
  def analyticsName: String
  def url: String  = s"/$id"
  def linkText: String = webTitle
  def pagination: Option[Pagination] = None
  def description: Option[String] = None
  def rssPath: Option[String] = None

  lazy val title: String = webTitle
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
    "blockVideoAds" -> false
  )

  def openGraph: Map[String, Any] = Map(
    "og:site_name" -> "the Guardian",
    "fb:app_id"    -> Configuration.facebook.appId,
    "og:type"      -> "website",
    "og:url"       -> s"${Configuration.site.host}$url"
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
  val analyticsName: String,
  override val pagination: Option[Pagination] = None,
  override val description: Option[String] = None) extends MetaData

object Page {
  def apply(
    id: String,
    section: String,
    webTitle: String,
    analyticsName: String,
    pagination: Option[Pagination] = None,
    description: Option[String] = None) = new Page(id, section, webTitle, analyticsName, pagination, description)
}

trait Elements {

  private val trailPicMinDesiredSize = 460

  // Find a main picture crop which matches this aspect ratio.
  def trailPicture(aspectWidth: Int, aspectHeight: Int): Option[ImageContainer] =
    (thumbnail.find(_.imageCrops.exists(_.width >= trailPicMinDesiredSize)) ++ mainPicture ++ thumbnail)
      .map{ image =>
        image.imageCrops.filter{ crop => crop.aspectRatioWidth == aspectWidth && crop.aspectRatioHeight == aspectHeight } match {
          case Nil   => None
          case crops => Option(ImageContainer(crops, image.delegate, image.index))
        }
      }
      .flatten
      .headOption

  // trail picture is used on index pages (i.e. Fronts and tag pages)
  def trailPicture: Option[ImageContainer] = thumbnail.find(_.imageCrops.exists(_.width >= trailPicMinDesiredSize))
    .orElse(mainPicture)
    .orElse(thumbnail)

  /*
  Now I know you might THINK that you want to change how we get the main picture.
  The people around you might have convinced you that there is some magic formula.
  There might even be a 'Business Stakeholder' involved...

  But know this... I WILL find you, I WILL hunt you down, and you WILL be sorry.

  If you need to express a hack, express it somewhere where you are not pretending it is the Main Picture

  You probably want the TRAIL PICTURE
*/
  // main picture is used on the content page (i.e. the article page or the video page)

  // if you change these rules make sure you update IMAGES.md (in this project)
  def mainPicture: Option[ImageContainer] = images.find(_.isMain)

  lazy val hasMainPicture = mainPicture.flatMap(_.imageCrops.headOption).isDefined

  def mainVideo: Option[VideoElement] = videos.find(_.isMain).headOption
  lazy val hasMainVideo: Boolean = mainVideo.flatMap(_.videoAssets.headOption).isDefined

  lazy val bodyImages: Seq[ImageElement] = images.filter(_.isBody)
  lazy val bodyVideos: Seq[VideoElement] = videos.filter(_.isBody)
  lazy val videoAssets: Seq[VideoAsset] = videos.flatMap(_.videoAssets)
  lazy val thumbnail: Option[ImageElement] = images.find(_.isThumbnail)

  def elements: Seq[Element] = Nil

  protected lazy val images: Seq[ImageElement] = elements.filter(_.isImage)
    .map(e => new ImageElement(e.delegate, e.index))

  protected lazy val videos: Seq[VideoElement] = elements.filter(_.isVideo)
    .map(e => new VideoElement(e.delegate, e.index))

}

trait Tags {
  def tags: Seq[Tag] = Nil
  def contributorAvatar: Option[String] = tags.flatMap(_.contributorImagePath).headOption

  private def tagsOfType(tagType: String): Seq[Tag] = tags.filter(_.tagType == tagType)

  lazy val keywords: Seq[Tag] = tagsOfType("keyword")
  lazy val contributors: Seq[Tag] = tagsOfType("contributor")
  lazy val series: Seq[Tag] = tagsOfType("series")
  lazy val blogs: Seq[Tag] = tagsOfType("blog")
  lazy val tones: Seq[Tag] = tagsOfType("tone")
  lazy val types: Seq[Tag] = tagsOfType("type")

  def isSponsored = DfpAgent.isSponsored(keywords)
}
