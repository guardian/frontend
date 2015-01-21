package model

import common.{NavItem, Edition, ManifestData, Pagination}
import conf.Configuration
import dfp.DfpAgent
import play.api.libs.json.{JsBoolean, JsValue, JsString}

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

  lazy val canonicalUrl: Option[String] = None

  // i.e. show the link back to the desktop site
  def hasClassicVersion: Boolean = !special

  // Special means "Next Gen platform only".
  private lazy val special = id.contains("-sp-")

  def title: Option[String] = None
  // this is here so it can be included in analytics.
  // Basically it helps us understand the impact of changes and needs
  // to be an integral part of each page
  def buildNumber: String = ManifestData.build
  def revision: String = ManifestData.revision

  //must be one of... http://schema.org/docs/schemas.html
  def schemaType: Option[String] = None

  lazy val isFront = false
  lazy val contentType = ""

  def adUnitSuffix = section

  def hasPageSkin(edition: Edition) = false
  lazy val isInappropriateForSponsorship: Boolean = false

  def isSurging: Seq[Int] = Seq(0)

  def metaData: Map[String, JsValue] = Map(
    ("pageId", JsString(id)),
    ("section", JsString(section)),
    ("webTitle", JsString(webTitle)),
    ("buildNumber", JsString(buildNumber)),
    ("revisionNumber", JsString(revision)),
    ("analyticsName", JsString(analyticsName)),
    ("isFront", JsBoolean(isFront)),
    ("adUnit", JsString(s"/${Configuration.commercial.dfpAccountId}/${Configuration.commercial.dfpAdUnitRoot}/$adUnitSuffix/ng")),
    ("isSurging", JsString(isSurging.mkString(","))),
    ("hasClassicVersion", JsBoolean(hasClassicVersion)),
    ("isAdvertisementFeature", JsBoolean(isAdvertisementFeature)),
    ("videoJsFlashSwf", JsString(conf.Static("flash/components/video-js-swf/video-js.swf").path)),
    ("videoJsVpaidSwf", JsString(conf.Static("flash/components/video-js-vpaid/video-js.swf").path))
  )

  def openGraph: Map[String, String] = Map(
    "og:site_name" -> "the Guardian",
    "fb:app_id"    -> Configuration.facebook.appId,
    "og:type"      -> "website",
    "og:url"       -> s"${Configuration.site.host}$url"
  )

  def openGraphImages: Seq[String] = Seq()

  def cards: List[(String, String)] = List(
    "twitter:site" -> "@guardian",
    "twitter:app:name:iphone" -> "The Guardian",
    "twitter:app:id:iphone" -> "409128287",
    "twitter:app:name:googleplay" -> "The Guardian",
    "twitter:app:id:googleplay" -> "com.guardian"
  )

  def cacheSeconds = 60

  def customSignPosting: Option[NavItem] = None

  override def isSponsored(maybeEdition: Option[Edition]): Boolean =
    DfpAgent.isSponsored(tags, Some(section), maybeEdition)
  override lazy val isFoundationSupported: Boolean = DfpAgent.isFoundationSupported(tags, Some(section))
  override lazy val isAdvertisementFeature: Boolean = DfpAgent.isAdvertisementFeature(tags, Some(section))
  lazy val isExpiredAdvertisementFeature: Boolean = DfpAgent.isExpiredAdvertisementFeature(tags, Some(section))
  lazy val sponsorshipTag: Option[Tag] = DfpAgent.sponsorshipTag(tags, Some(section))
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
    description: Option[String] = None,
    maybeContentType: Option[String] = None,
    maybeCanonicalUrl: Option[String] = None
  ) = new Page(id, section, webTitle, analyticsName, pagination, description) {
    override lazy val contentType = maybeContentType.getOrElse("")
    override lazy val canonicalUrl = maybeCanonicalUrl
    override def metaData: Map[String, JsValue] =
      super.metaData ++ maybeContentType.map(contentType => List("contentType" -> JsString(contentType))).getOrElse(Nil)
  }
}

class TagCombiner(
  id: String,
  val leftTag: Tag,
  val rightTag: Tag,
  override val pagination: Option[Pagination] = None
) extends Page(
  id,
  leftTag.section,
  s"${leftTag.name} + ${rightTag.name}",
  s"GFE:${leftTag.section}:${leftTag.name} + ${rightTag.name}",
  pagination,
  Some(GuardianContentTypes.TagIndex)
)


trait Elements {

  private val trailPicMinDesiredSize = 460

  val AspectRatioThreshold = 0.01

  // Find a main picture crop which matches this aspect ratio.
  def trailPictureAll(aspectWidth: Int, aspectHeight: Int): List[ImageContainer] = {
    val desiredAspectRatio = aspectWidth.toDouble / aspectHeight

    (thumbnail.find(_.imageCrops.exists(_.width >= trailPicMinDesiredSize)) ++ mainPicture ++ thumbnail)
      .map { image =>
      image.imageCrops.filter { crop =>
        aspectHeight.toDouble * crop.width != 0 &&
          Math.abs((aspectWidth.toDouble * crop.height) / (aspectHeight.toDouble * crop.width) - 1 ) <= AspectRatioThreshold
      } match {
        case Nil => None
        case crops => Option(ImageContainer(crops, image.delegate, image.index))
      }
    }
      .flatten
      .toList
  }

  def trailPicture(aspectWidth: Int, aspectHeight: Int): Option[ImageContainer] = trailPictureAll(aspectWidth, aspectHeight).headOption

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

  def mainAudio: Option[AudioElement] = audios.find(_.isMain).headOption
  lazy val hasMainAudio: Boolean = mainAudio.flatMap(_.audioAssets.headOption).isDefined

  def mainEmbed: Option[EmbedElement] = embeds.find(_.isMain).headOption
  lazy val hasMainEmbed: Boolean = mainEmbed.flatMap(_.embedAssets.headOption).isDefined

  lazy val bodyImages: Seq[ImageElement] = images.filter(_.isBody)
  lazy val bodyVideos: Seq[VideoElement] = videos.filter(_.isBody)
  lazy val videoAssets: Seq[VideoAsset] = videos.flatMap(_.videoAssets)
  lazy val audioAssets: Seq[AudioAsset] = audios.flatMap(_.audioAssets)
  lazy val thumbnail: Option[ImageElement] = images.find(_.isThumbnail)

  def elements: Seq[Element] = Nil
  def elements(relation: String): Seq[Element] = relation match {
    case "main" => elements.filter(_.isMain)
    case "body" => elements.filter(_.isBody)
    case "gallery" => elements.filter(_.isGallery)
    case "thumbnail" => elements.filter(_.isThumbnail)
    case _ => Nil
  }

  protected lazy val images: Seq[ImageElement] = elements.flatMap {
    case image :ImageElement => Some(image)
    case _ => None
  }

  protected lazy val videos: Seq[VideoElement] = elements.flatMap {
    case video: VideoElement => Some(video)
    case _ => None
  }

  protected lazy val audios: Seq[AudioElement] = elements.flatMap {
    case audio: AudioElement => Some(audio)
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
  lazy val nonKeywordTags: Seq[Tag] = tags.filterNot(_.tagType == "keyword")
  lazy val contributors: Seq[Tag] = tagsOfType("contributor")
  lazy val isContributorPage: Boolean = contributors.nonEmpty
  lazy val series: Seq[Tag] = tagsOfType("series")
  lazy val blogs: Seq[Tag] = tagsOfType("blog")
  lazy val tones: Seq[Tag] = tagsOfType("tone")
  lazy val types: Seq[Tag] = tagsOfType("type")

  def isSponsored(maybeEdition: Option[Edition] = None): Boolean
  def hasMultipleSponsors: Boolean = DfpAgent.hasMultipleSponsors(tags)
  def isAdvertisementFeature: Boolean
  def hasMultipleFeatureAdvertisers: Boolean = DfpAgent.hasMultipleFeatureAdvertisers(tags)
  def isFoundationSupported: Boolean
  def hasInlineMerchandise: Boolean = DfpAgent.hasInlineMerchandise(tags)
  def sponsor(edition: Edition): Option[String] = DfpAgent.getSponsor(tags, edition)
  def sponsorshipType: Option[String] = {
    if (isSponsored()) {
      Option("sponsoredfeatures")
    } else if (isAdvertisementFeature) {
      Option("advertisement-features")
    } else if (isFoundationSupported) {
      Option("foundation-features")
    } else {
      None
    }
  }

  // Tones are all considered to be 'News' it is the default so we do not list news tones explicitly
  /**
   * NOTE:
   *
   * This is used only for OLD-STYLE containers. It only includes the visual tones those containers care about. For
   * the new container equivalent, see `views.support.CardStyle`.
   *
   * TODO: Once we've deleted all of the old-style containers, remove this.
   */
  lazy val visualTone: String =
    if (isLiveBlog) Tags.VisualTone.Live
    else if (isComment) Tags.VisualTone.Comment
    else if (isFeature) Tags.VisualTone.Feature
    else Tags.VisualTone.News

  lazy val isLiveBlog: Boolean = tones.exists(t => Tags.liveMappings.contains(t.id))
  lazy val isComment = tones.exists(t => Tags.commentMappings.contains(t.id))
  lazy val isFeature = tones.exists(t => Tags.featureMappings.contains(t.id))
  lazy val isReview = tones.exists(t => Tags.reviewMappings.contains(t.id))
  lazy val isMedia = types.exists(t => Tags.mediaTypes.contains(t.id))
  lazy val isAnalysis = tones.exists(_.id == Tags.Analysis)
  lazy val isPodcast = isAudio && (types.exists(_.id == Tags.Podcast) || tags.exists(_.podcast.isDefined))
  lazy val isAudio = types.exists(_.id == Tags.Audio)
  lazy val isEditorial = tones.exists(_.id == Tags.Editorial)
  lazy val isCartoon = types.exists(_.id == Tags.Cartoon)
  lazy val isLetters = tones.exists(_.id == Tags.Letters)
  lazy val isCrossword = types.exists(_.id == Tags.Crossword)

  lazy val hasLargeContributorImage: Boolean = tagsOfType("contributor").filter(_.contributorLargeImagePath.nonEmpty).nonEmpty

  lazy val isCricketLiveBlog = isLiveBlog &&
    tags.exists(t => t.id == "sport/england-cricket-team") &&
    tags.exists(t => t.id == "sport/over-by-over-reports")
}

object Tags {
  val Analysis = "tone/analysis"
  val Audio = "type/audio"
  val Cartoon = "type/cartoon"
  val Crossword = "type/crossword"
  val Editorial = "tone/editorials"
  val Letters = "tone/letters"
  val Podcast = "type/podcast"

  object VisualTone {
    val Live = "live"
    val Comment = "comment"
    val Feature = "feature"
    val News = "news"
  }

  val liveMappings = Seq(
    "tone/minutebyminute"
  )

  val commentMappings = Seq (
    "tone/comment"
  )

  val mediaTypes = Seq(
    "type/video",
    "type/audio",
    "type/gallery",
    "type/picture"
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
