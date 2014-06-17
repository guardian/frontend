package model

import common.{Pagination, ManifestData}
import conf.Configuration
import dfp.DfpAgent
import conf.Switches._

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

  def title: Option[String] = None
  // this is here so it can be included in analytics.
  // Basically it helps us understand the impact of changes and needs
  // to be an integral part of each page
  def buildNumber: String = ManifestData.build

  //must be one of... http://schema.org/docs/schemas.html
  def schemaType: Option[String] = None

  lazy val isFront = false
  lazy val contentType = ""

  lazy val adUnitSuffix = if (isFront) section + "/front" else section

  lazy val hasPageSkin = false

  def metaData: Map[String, Any] = Map(
    ("page-id", id),
    ("section", section),
    ("web-title", webTitle),
    ("build-number", buildNumber),
    ("analytics-name", analyticsName),
    ("blockVideoAds", false),
    ("is-front", isFront),
    ("ad-unit-suffix", adUnitSuffix)
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
  lazy val hasShowcaseMainPicture = {
    val showcase = for {
      main  <- mainPicture
      image <- main.largestImage
      role  <- image.role
    } yield role == "showcase"
    showcase.getOrElse(false)
  }

  def mainVideo: Option[VideoElement] = videos.find(_.isMain).headOption
  lazy val hasMainVideo: Boolean = mainVideo.flatMap(_.videoAssets.headOption).isDefined

  def mainEmbed: Option[EmbedElement] = embeds.find(_.isMain).headOption
  lazy val hasMainEmbed: Boolean = mainEmbed.flatMap(_.embedAssets.headOption).isDefined

  lazy val bodyImages: Seq[ImageElement] = images.filter(_.isBody)
  lazy val bodyVideos: Seq[VideoElement] = videos.filter(_.isBody)
  lazy val videoAssets: Seq[VideoAsset] = videos.flatMap(_.videoAssets)
  lazy val thumbnail: Option[ImageElement] = images.find(_.isThumbnail)

  def elements: Seq[Element] = Nil

  protected lazy val images: Seq[ImageElement] = elements.flatMap {
    case image :ImageElement => Some(image)
    case _ => None
  }

  protected lazy val videos: Seq[VideoElement] = elements.flatMap {
    case video: VideoElement => Some(video)
    case _ => None
  }

  protected lazy val embeds: Seq[EmbedElement] = elements.flatMap {
    case embed: EmbedElement => Some(embed)
    case _ => None
  }
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

  def isSponsored = DfpAgent.isSponsored(tags)
  def isAdvertisementFeature = DfpAgent.isAdvertisementFeature(tags)

  // Tones are all considered to be 'News' it is the default so we do not list news tones explicitly
  lazy val visualTone: String =
    if (isLiveBlog) Tags.VisualTone.Live
    else if (isComment) Tags.VisualTone.Comment
    else if (isFeature) Tags.VisualTone.Feature
    else Tags.VisualTone.News

  lazy val isLiveBlog: Boolean = tones.exists(t => Tags.liveMappings.contains(t.id))
  lazy val isComment = tones.exists(t => Tags.commentMappings.contains(t.id))
  lazy val isFeature = tones.exists(t => Tags.featureMappings.contains(t.id))
  lazy val isReview = tones.exists(t => Tags.reviewMappings.contains(t.id))
}

object Tags {

  object VisualTone {
    val Live = "live"
    val Comment = "comment"
    val Feature = "feature"
    val News = "news"
  }

  val liveMappings = Seq(
    "tone/minutebyminute"
  )

  val commentMappings = Seq(
    "tone/comment",
    "tone/letters",
    "tone/editorials"
  )

  val featureMappings = Seq(
    "tone/features",
    "tone/recipes",
    "tone/interview",
    "tone/performances",
    "tone/extract",
    "tone/reviews",
    "tone/albumreview",
    "tone/livereview",
    "tone/childrens-user-reviews"
  )

  val reviewMappings = Seq(
    "tone/reviews"
  )
}
