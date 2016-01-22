package model

import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichCapiDateTime
import common.dfp._
import common.{Edition, ManifestData, NavItem, Pagination}
import conf.Configuration
import cricketPa.CricketTeams
import model.liveblog.BodyBlock
import model.meta.{Guardian, LinkedData, PotentialAction, WebPage}
import ophan.SurgingContentAgent
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import play.api.libs.json.{JsBoolean, JsString, JsValue}

object Commercial {

  private def make(metadata: MetaData, tags: Tags, maybeApiContent: Option[contentapi.Content]): model.Commercial = {

    val section = Some(metadata.section)

    val isInappropriateForSponsorship =
      maybeApiContent exists (_.fields.flatMap(_.isInappropriateForSponsorship).getOrElse(false))

    DfpAgent.winningTagPair(capiTags = tags.tags, sectionId = section, edition = None) map { tagPair =>
      val dfpTag = tagPair.dfpTag
      model.Commercial(
        tags,
        metadata,
        isInappropriateForSponsorship,
        sponsorshipTag = Some(tagPair.capiTag),
        isFoundationSupported = dfpTag.paidForType == FoundationFunded,
        isAdvertisementFeature = dfpTag.paidForType == AdvertisementFeature,
        hasMultipleSponsors = DfpAgent.hasMultipleSponsors(tags.tags),
        hasMultipleFeatureAdvertisers = DfpAgent.hasMultipleFeatureAdvertisers(tags.tags),
        hasInlineMerchandise = DfpAgent.hasInlineMerchandise(tags.tags)
      )
    } getOrElse model.Commercial(
      tags,
      metadata,
      isInappropriateForSponsorship,
      sponsorshipTag = None,
      isFoundationSupported = false,
      isAdvertisementFeature = false,
      hasMultipleSponsors = false,
      hasMultipleFeatureAdvertisers = false,
      hasInlineMerchandise = false
    )
  }

  def make(metadata: MetaData, tags: Tags, apiContent: contentapi.Content): model.Commercial = {
    make(metadata, tags, Some(apiContent))
  }

  def make(metadata: MetaData, tags: Tags): model.Commercial = {
    make(metadata, tags, None)
  }

  def make(section: Section): model.Commercial = {
    val keywordSponsorship = section.keywordSponsorship
    model.Commercial(
      tags = Tags(Nil),
      metadata = section.metadata,
      isInappropriateForSponsorship = false,
      sponsorshipTag = None,
      isFoundationSupported = keywordSponsorship.isFoundationSupported,
      isAdvertisementFeature = keywordSponsorship.isAdvertisementFeature,
      hasMultipleSponsors = keywordSponsorship.hasMultipleSponsors,
      hasMultipleFeatureAdvertisers = keywordSponsorship.hasMultipleFeatureAdvertisers,
      hasInlineMerchandise = false
    )
  }
}

final case class Commercial(
  tags: Tags,
  metadata: MetaData,
  isInappropriateForSponsorship: Boolean,
  sponsorshipTag: Option[Tag],
  isFoundationSupported: Boolean,
  isAdvertisementFeature: Boolean,
  hasMultipleSponsors: Boolean,
  hasMultipleFeatureAdvertisers: Boolean,
  hasInlineMerchandise: Boolean
) {

  def sponsorshipType: Option[String] = {
    if (isSponsored(None)) {
      Option("sponsoredfeatures")
    } else if (isAdvertisementFeature) {
      Option("advertisement-features")
    } else if (isFoundationSupported) {
      Option("foundation-features")
    } else {
      None
    }
  }

  def isSponsored(maybeEdition: Option[Edition]): Boolean =
    DfpAgent.isSponsored(tags.tags, Some(metadata.section), maybeEdition)

  def javascriptConfig: Map[String, JsValue] = Map(
    ("isAdvertisementFeature", JsBoolean(isAdvertisementFeature))
  )
}
/**
 * MetaData represents a page on the site, whether facia or content
 */
object Fields {
  def make(apiContent: contentapi.Content) = {
    Fields (
      trailText = apiContent.fields.flatMap(_.trailText),
      linkText = apiContent.webTitle,
      shortUrl = apiContent.fields.flatMap(_.shortUrl).getOrElse(""),
      standfirst = apiContent.fields.flatMap(_.standfirst),
      main = apiContent.fields.flatMap(_.main).getOrElse(""),
      body = apiContent.fields.flatMap(_.body).getOrElse(""),
      blocks = BodyBlock.make(apiContent.blocks),
      lastModified = apiContent.fields.flatMap(_.lastModified).map(_.toJodaDateTime).getOrElse(DateTime.now),
      displayHint = apiContent.fields.flatMap(_.displayHint).getOrElse(""),
      isLive = apiContent.fields.flatMap(_.liveBloggingNow).getOrElse(false)
    )
  }
}

final case class Fields(
  trailText: Option[String],
  linkText: String,
  shortUrl: String,
  standfirst: Option[String],
  main: String,
  body: String,
  blocks: Seq[BodyBlock],
  lastModified: DateTime,
  displayHint: String,
  isLive: Boolean
){
  def javascriptConfig: Map[String, JsValue] = Map(("shortUrl", JsString(shortUrl)))
}

object MetaData {

  def make(
    id: String,
    section: String,
    webTitle: String,
    analyticsName: String,
    url: Option[String] = None,
    canonicalUrl: Option[String] = None,
    shouldGoogleIndex: Boolean = true,
    pagination: Option[Pagination] = None,
    description: Option[String] = None,
    title: Option[String] = None,
    isFront: Boolean = false,
    isPressedPage: Boolean = false,
    contentType: String = "",
    adUnitSuffix: Option[String] = None,
    customSignPosting: Option[NavItem] = None,
    iosType: Option[String] = Some("Article"),
    javascriptConfigOverrides: Map[String, JsValue] = Map(),
    opengraphPropertiesOverrides: Map[String, String] = Map(),
    twitterPropertiesOverrides: Map[String, String] = Map()
    ): MetaData = {

    val resolvedUrl = url.getOrElse(s"/$id")

    MetaData(
      id = id,
      url = resolvedUrl,
      webUrl = s"${Configuration.site.host}$resolvedUrl",
      webTitle = webTitle,
      section = section,
      analyticsName = analyticsName,
      adUnitSuffix = adUnitSuffix getOrElse section,
      canonicalUrl = canonicalUrl,
      shouldGoogleIndex = shouldGoogleIndex,
      pagination = pagination,
      description = description,
      title = title,
      isFront = isFront,
      isPressedPage = isPressedPage,
      contentType = contentType,
      customSignPosting = customSignPosting,
      javascriptConfigOverrides = javascriptConfigOverrides,
      opengraphPropertiesOverrides = opengraphPropertiesOverrides,
      twitterPropertiesOverrides = twitterPropertiesOverrides)
  }

  def make(fields: Fields, apiContent: contentapi.Content) = {
    val id = apiContent.id
    val url = s"/$id"
    val section = apiContent.sectionId.getOrElse("")

    MetaData(
      id = id,
      url = url,
      webUrl = apiContent.webUrl,
      section = section,
      webTitle = apiContent.webTitle,
      membershipAccess = apiContent.fields.flatMap(_.membershipAccess.map(_.name)),
      analyticsName = s"GFE:$section:${id.substring(id.lastIndexOf("/") + 1)}",
      adUnitSuffix = section,
      description = apiContent.fields.flatMap(_.trailText),
      cacheSeconds = {
        if (fields.isLive) 5
        else if (fields.lastModified > DateTime.now(fields.lastModified.getZone) - 1.hour) 10
        else if (fields.lastModified > DateTime.now(fields.lastModified.getZone) - 24.hours) 30
        else 300
      }
    )
  }
}

final case class MetaData (
  id: String,
  url: String,
  webUrl: String,
  section: String,
  webTitle: String,
  analyticsName: String,
  adUnitSuffix: String,
  iosType: Option[String] = Some("Article"),
  pagination: Option[Pagination] = None,
  description: Option[String] = None,
  rssPath: Option[String] = None,
  contentType: String = "",
  isImmersive: Boolean = false,
  schemaType: Option[String] = None, // Must be one of... http://schema.org/docs/schemas.html
  cacheSeconds: Int = 60,
  openGraphImages: Seq[String] = Seq(),
  membershipAccess: Option[String] = None,
  isFront: Boolean = false,
  isPressedPage: Boolean = true,
  hideUi: Boolean = false,
  canonicalUrl: Option[String] = None,
  shouldGoogleIndex: Boolean = true,
  title: Option[String] = None,
  customSignPosting: Option[NavItem] = None,
  javascriptConfigOverrides: Map[String, JsValue] = Map(),
  opengraphPropertiesOverrides: Map[String, String] = Map(),
  twitterPropertiesOverrides: Map[String, String] = Map(),
  isMinute: Boolean = false
){

  def hasPageSkin(edition: Edition) = if (isPressedPage){
    DfpAgent.isPageSkinned(adUnitSuffix, edition)
  } else false
  def sizeOfTakeoverAdsInSlot(slot: AdSlot, edition: Edition): Seq[AdSize] = if (isPressedPage) {
    DfpAgent.sizeOfTakeoverAdsInSlot(slot, adUnitSuffix, edition)
  } else Nil
  def hasAdInBelowTopNavSlot(edition: Edition) = if (isPressedPage) {
    DfpAgent.hasAdInTopBelowNavSlot(adUnitSuffix, edition)
  } else false
  def omitMPUsFromContainers(edition: Edition) = if (isPressedPage) {
    DfpAgent.omitMPUsFromContainers(id, edition)
  } else false

  val isSurging: Seq[Int] = SurgingContentAgent.getSurgingLevelsFor(id)

  val requiresMembershipAccess: Boolean = {
    conf.switches.Switches.MembersAreaSwitch.isSwitchedOn && membershipAccess.nonEmpty && url.contains("/membership/")
  }

  val hasSlimHeader: Boolean = contentType == "Interactive" || section == "identity"

  val hasNoHeader: Boolean = (isImmersive || isMinute)

  // Special means "Next Gen platform only".
  private val special = id.contains("-sp-")

  // this is here so it can be included in analytics.
  // Basically it helps us understand the impact of changes and needs
  // to be an integral part of each page
  def buildNumber: String = ManifestData.build
  def revision: String = ManifestData.revision

  def javascriptConfig: Map[String, JsValue] = Map(
    ("pageId", JsString(id)),
    ("section", JsString(section)),
    ("webTitle", JsString(webTitle)),
    ("adUnit", JsString(s"/${Configuration.commercial.dfpAccountId}/${Configuration.commercial.dfpAdUnitRoot}/$adUnitSuffix/ng")),
    ("buildNumber", JsString(buildNumber)),
    ("revisionNumber", JsString(revision)),
    ("analyticsName", JsString(analyticsName)),
    ("isFront", JsBoolean(isFront)),
    ("isSurging", JsString(isSurging.mkString(","))),
    ("videoJsFlashSwf", JsString(conf.Static("flash/components/video-js-swf/video-js.swf").path)),
    ("videoJsVpaidSwf", JsString(conf.Static("flash/components/video-js-vpaid/video-js.swf").path))
  )

  def opengraphProperties: Map[String, String] = Map(
    "og:site_name" -> "the Guardian",
    "fb:app_id"    -> Configuration.facebook.appId,
    "og:type"      -> "website",
    "og:url"       -> webUrl) ++ (iosId("applinks") map (iosId => List(
    "al:ios:url" -> s"gnmguardian://$iosId",
    "al:ios:app_store_id" -> "409128287",
    "al:ios:app_name" -> "The Guardian"
  )) getOrElse Nil)

  def twitterProperties: Map[String, String] = Map(
    "twitter:site" -> "@guardian") ++ (iosId("twitter") map (iosId => List(
    "twitter:app:name:iphone" -> "The Guardian",
    "twitter:app:id:iphone" -> "409128287",
    "twitter:app:url:iphone" -> s"gnmguardian://$iosId",
    "twitter:app:name:ipad" -> "The Guardian",
    "twitter:app:id:ipad" -> "409128287",
    "twitter:app:url:ipad" -> s"gnmguardian://$iosId",
    "twitter:app:name:googleplay" -> "The Guardian",
    "twitter:app:id:googleplay" -> "com.guardian"
  )) getOrElse Nil)

  def linkedData: List[LinkedData] = List(
    Guardian()) ++ (iosType.map(_ => List(
    WebPage(webUrl, PotentialAction(target = "android-app://com.guardian/" + webUrl.replace("://", "/")))
  )).getOrElse(Nil))

  def iosId(referrer: String): Option[String] = iosType.map(iosType => s"$id?contenttype=$iosType&source=$referrer")
}

object Page {

  def getContentPage(page: Page): Option[ContentPage] = page match {
    case c: ContentPage => Some(c)
    case _ => None
  }

  def getStandalonePage(page: Page): Option[StandalonePage] = page match {
    case s: StandalonePage => Some(s)
    case _ => None
  }

  def getContent(page: Page): Option[ContentType] = {
    getContentPage(page).map(_.item)
  }
}

// A Page is something that has metadata, and anything with Metadata can be rendered.
trait Page {
 def metadata: MetaData
}

// ContentPage objects use data from a ContentApi item to populate metadata.
trait ContentPage extends Page {
  def item: ContentType
  final override val metadata = item.metadata

  // The order of construction is important, overrides must come last.
  def getJavascriptConfig: Map[String, JsValue] =
    item.fields.javascriptConfig ++
    metadata.javascriptConfig ++
    item.tags.javascriptConfig ++
    item.trail.javascriptConfig ++
    item.commercial.javascriptConfig ++
    item.content.conditionalConfig ++
    item.content.javascriptConfig ++
    metadata.javascriptConfigOverrides

  def getOpenGraphProperties: Map[String, String] =
    metadata.opengraphProperties ++
    item.content.opengraphProperties ++
    metadata.opengraphPropertiesOverrides

  def getTwitterProperties: Map[String, String] =
    metadata.twitterProperties ++
    item.content.twitterProperties ++
    metadata.twitterPropertiesOverrides
}
case class SimpleContentPage(content: ContentType) extends ContentPage {
  override lazy val item: ContentType = content
}

// StandalonePage objects manage their own metadata.
trait StandalonePage extends Page {

  // These methods are part of StandalonePage, not MetaData. In the scenario below, the page's config
  // is wholly made from the metadata object. But pages made from ContentPage use several objects
  // to create a page config. So placing the accessors here instead of Metadata reduces confusion a little.

  def getJavascriptConfig: Map[String, JsValue] =
    metadata.javascriptConfig ++ metadata.javascriptConfigOverrides

  def getOpenGraphProperties: Map[String, String] =
    metadata.opengraphProperties ++ metadata.opengraphPropertiesOverrides

  def getTwitterProperties: Map[String, String] =
    metadata.twitterProperties ++ metadata.twitterPropertiesOverrides
}

case class SimplePage(override val metadata: MetaData) extends StandalonePage

case class CommercialExpiryPage(
  id: String,
  section: String = "global",
  webTitle: String = "This page has been removed",
  analyticsName: String = "GFE:Gone") extends StandalonePage {

  override val metadata: MetaData = MetaData.make(id, section, webTitle, analyticsName, shouldGoogleIndex = false)
}

case class TagCombiner(
  id: String,
  leftTag: Tag,
  rightTag: Tag,
  pagination: Option[Pagination] = None
) extends StandalonePage {

  override val metadata: MetaData = MetaData.make(
    id,
    leftTag.metadata.section,
    s"${leftTag.name} + ${rightTag.name}",
    s"GFE:${leftTag.metadata.section}:${leftTag.name} + ${rightTag.name}",
    pagination = pagination,
    description = Some(GuardianContentTypes.TagIndex)
  )
}

object IsRatio {

  val AspectRatioThreshold = 0.01

  def apply(aspectWidth: Int, aspectHeight: Int, width: Int, height: Int): Boolean = {
    aspectHeight.toDouble * width != 0 &&
      Math.abs((aspectWidth.toDouble * height) / (aspectHeight.toDouble * width) - 1) <= AspectRatioThreshold
  }

}

/**
 * ways to access/filter the elements that make up an entity on a facia page
 *
 * designed to add some structure to the data that comes from CAPI
 */
object Elements {
  def make(apiContent: contentapi.Content) = {
    Elements(apiContent.elements
      .map(_.zipWithIndex.map { case (element, index) => Element(element, index) })
      .getOrElse(Nil))
  }
}
final case class Elements(elements: Seq[Element]) {

  val trailPicMinDesiredSize = 460

  // Find a main picture crop which matches this aspect ratio.
  def trailPictureAll(aspectWidth: Int, aspectHeight: Int): List[Element] = {

    (thumbnail.find(_.images.imageCrops.exists(_.width >= trailPicMinDesiredSize)) ++ mainPicture ++ thumbnail).flatMap { image: ImageElement =>
      image.images.imageCrops.filter { crop =>
        IsRatio(aspectWidth, aspectHeight, crop.width, crop.height)
      } match {
        case Nil => None
        case crops => Some(image)
      }
    } .toList
  }

  def trailPicture(aspectWidth: Int, aspectHeight: Int): Option[Element] = trailPictureAll(aspectWidth, aspectHeight).headOption

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
  def mainPicture: Option[ImageElement] = images.find(_.properties.isMain)

  lazy val hasMainPicture = mainPicture.flatMap(_.images.imageCrops.headOption).isDefined

  // Currently, only Picture and Embed elements can be given the showcase role.
  lazy val hasShowcaseMainElement = {
    val showcasePicture = for {
      main  <- mainPicture
      image <- main.images.largestImage
      role  <- image.role
    } yield role == "showcase"

    val showcaseEmbed = for {
      embed <- mainEmbed
      asset <- embed.embeds.embedAssets.headOption
      role <- asset.role
    } yield role == "showcase"

    showcasePicture.getOrElse(false) || showcaseEmbed.getOrElse(false)
  }

  def mainVideo: Option[VideoElement] = videos.find(_.properties.isMain)
  lazy val hasMainVideo: Boolean = mainVideo.flatMap(_.videos.videoAssets.headOption).isDefined

  def mainAudio: Option[AudioElement] = audios.find(_.properties.isMain)
  lazy val hasMainAudio: Boolean = mainAudio.flatMap(_.audio.audioAssets.headOption).isDefined

  def mainEmbed: Option[EmbedElement] = embeds.find(_.properties.isMain)
  lazy val hasMainEmbed: Boolean = mainEmbed.flatMap(_.embeds.embedAssets.headOption).isDefined

  lazy val bodyImages: Seq[ImageElement] = images.filter(_.properties.isBody)
  lazy val bodyVideos: Seq[VideoElement] = videos.filter(_.properties.isBody)
  lazy val videoAssets: Seq[VideoAsset] = videos.flatMap(_.videos.videoAssets)
  lazy val audioAssets: Seq[AudioAsset] = audios.flatMap(_.audio.audioAssets)
  lazy val thumbnail: Option[ImageElement] = images.find(_.properties.isThumbnail)

  def elements(relation: String): Seq[Element] = relation match {
    case "main" => elements.filter(_.properties.isMain)
    case "body" => elements.filter(_.properties.isBody)
    case "gallery" => elements.filter(_.properties.isGallery)
    case "thumbnail" => elements.filter(_.properties.isThumbnail)
    case _ => Nil
  }

  lazy val images: Seq[ImageElement] = elements.flatMap {
    case image :ImageElement => Some(image)
    case _ => None
  }

  lazy val videos: Seq[VideoElement] = elements.flatMap {
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

/**
 * Tags lets you extract meaning from tags on a page.
 */
final case class Tags(
  tags: Seq[Tag]) {

  def contributorAvatar: Option[String] = tags.flatMap(_.contributorImagePath).headOption

  private def tagsOfType(tagType: String): Seq[Tag] = tags.filter(_.properties.tagType == tagType)

  lazy val keywords: Seq[Tag] = tagsOfType("Keyword")
  lazy val nonKeywordTags: Seq[Tag] = tags.filterNot(_.properties.tagType == "Keyword")
  lazy val contributors: Seq[Tag] = tagsOfType("Contributor")
  lazy val isContributorPage: Boolean = contributors.nonEmpty
  lazy val series: Seq[Tag] = tagsOfType("Series")
  lazy val blogs: Seq[Tag] = tagsOfType("Blog")
  lazy val tones: Seq[Tag] = tagsOfType("Tone")
  lazy val types: Seq[Tag] = tagsOfType("Type")


  lazy val richLink: Option[String] = tags.flatMap(_.richLinkId).headOption
  lazy val openModule: Option[String] = tags.flatMap(_.openModuleId).headOption
  lazy val sponsor: Option[String] = DfpAgent.getSponsor(tags)

  // Tones are all considered to be 'News' it is the default so we do not list news tones explicitly
  def isNews = !(isLiveBlog || isComment || isFeature)

  lazy val isLiveBlog: Boolean = tones.exists(t => Tags.liveMappings.contains(t.id))
  lazy val isComment = tones.exists(t => Tags.commentMappings.contains(t.id))
  lazy val isFeature = tones.exists(t => Tags.featureMappings.contains(t.id))
  lazy val isReview = tones.exists(t => Tags.reviewMappings.contains(t.id))
  lazy val isMedia = types.exists(t => Tags.mediaTypes.contains(t.id))
  lazy val isAnalysis = tones.exists(_.id == Tags.Analysis)
  lazy val isPodcast = isAudio && (types.exists(_.id == Tags.Podcast) || tags.exists(_.properties.podcast.isDefined))
  lazy val isAudio = types.exists(_.id == Tags.Audio)
  lazy val isEditorial = tones.exists(_.id == Tags.Editorial)
  lazy val isCartoon = types.exists(_.id == Tags.Cartoon)
  lazy val isLetters = tones.exists(_.id == Tags.Letters)
  lazy val isCrossword = types.exists(_.id == Tags.Crossword)
  lazy val isMatchReport = tones.exists(_.id == Tags.MatchReports)

  lazy val isArticle: Boolean = tags.exists { _.id == Tags.Article }
  lazy val isSudoku: Boolean = tags.exists { _.id == Tags.Sudoku } || tags.exists(t => t.id == "lifeandstyle/series/sudoku")
  lazy val isGallery: Boolean = tags.exists { _.id == Tags.Gallery }
  lazy val isVideo: Boolean = tags.exists { _.id == Tags.Video }
  lazy val isPoll: Boolean = tags.exists { _.id == Tags.Poll }
  lazy val isImageContent: Boolean = tags.exists { tag => List("type/cartoon", "type/picture", "type/graphic").contains(tag.id) }
  lazy val isInteractive: Boolean = tags.exists { _.id == Tags.Interactive }

  lazy val hasLargeContributorImage: Boolean = tagsOfType("Contributor").filter(_.properties.contributorLargeImagePath.nonEmpty).nonEmpty

  lazy val isCricketLiveBlog = isLiveBlog &&
    tags.map(_.id).exists(tagId => CricketTeams.teamTagIds.contains(tagId)) &&
    tags.map(_.id).contains("sport/over-by-over-reports")

  lazy val isRugbyMatch = (isMatchReport || isLiveBlog) &&
    tags.exists(t => t.id == "sport/rugby-union")

  lazy val isClimateChangeSeries = tags.exists(t => t.id =="environment/series/keep-it-in-the-ground")
  lazy val isUSMinuteSeries = tags.exists(t => t.id == "us-news/series/the-campaign-minute-2016")

  def javascriptConfig: Map[String, JsValue] = Map(
    ("keywords", JsString(keywords.map { _.name }.mkString(","))),
    ("keywordIds", JsString(keywords.map { _.id }.mkString(","))),
    ("nonKeywordTagIds", JsString(nonKeywordTags.map { _.id }.mkString(","))),
    ("richLink", JsString(richLink.getOrElse(""))),
    ("openModule", JsString(openModule.getOrElse(""))),
    ("author", JsString(contributors.map(_.name).mkString(","))),
    ("authorIds", JsString(contributors.map(_.id).mkString(","))),
    ("tones", JsString(tones.map(_.name).mkString(","))),
    ("toneIds", JsString(tones.map(_.id).mkString(","))),
    ("blogs", JsString(blogs.map { _.name }.mkString(","))),
    ("blogIds", JsString(blogs.map(_.id).mkString(",")))
  )
}

object Tags {
  val Analysis = "tone/analysis"
  val Audio = "type/audio"
  val Cartoon = "type/cartoon"
  val Crossword = "type/crossword"
  val Editorial = "tone/editorials"
  val Letters = "tone/letters"
  val Podcast = "type/podcast"
  val MatchReports = "tone/matchreports"

  val Article = "type/article"
  val Gallery = "type/gallery"
  val Video = "type/video"
  val Poll = "type/poll"
  val Interactive = "type/interactive"
  val Sudoku = "type/sudoku"

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
