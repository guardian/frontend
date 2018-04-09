package model

import com.gu.contentapi.client.model.v1.{Content => CapiContent}
import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentapi.client.utils.DesignType
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichContent
import implicits.Dates.CapiRichDateTime
import commercial.campaigns.PersonalInvestmentsCampaign
import common.commercial.{AdUnitMaker, CommercialProperties}
import common.dfp._
import common.{Edition, ManifestData, Pagination}
import conf.Configuration
import conf.cricketPa.CricketTeams
import model.content._
import model.liveblog.Blocks
import model.meta.{Guardian, LinkedData, PotentialAction, WebPage}
import org.apache.commons.lang3.StringUtils
import org.joda.time.DateTime
import com.github.nscala_time.time.Implicits._
import play.api.libs.json._
import play.api.libs.json.JodaWrites.JodaDateTimeWrites
import play.api.mvc.RequestHeader
import play.twirl.api.Html

object Commercial {

  def make(tags: Tags, apiContent: CapiContent): model.Commercial = {
    val isInappropriateForSponsorship: Boolean = apiContent.fields.exists(_.isInappropriateForSponsorship.contains(true))

    model.Commercial(
      isInappropriateForSponsorship,
      hasInlineMerchandise = DfpAgent.hasInlineMerchandise(tags.tags)
    )
  }

  val empty: model.Commercial = {
    model.Commercial(
      isInappropriateForSponsorship = false,
      hasInlineMerchandise = false
    )
  }
}

final case class Commercial(
  isInappropriateForSponsorship: Boolean,
  hasInlineMerchandise: Boolean)

/**
 * MetaData represents a page on the site, whether facia or content
 */
object Fields {
  // This is the time from which journalists start using the reader revenue flag in Composer.
  // For content published before then, we need handle it as we did before, taking
  // the sensitive flag to mean "don't display reader revenue asks"
  private val shouldHideReaderRevenueCutoffDate = new DateTime("2017-07-10T12:00:00.000Z")
  def make(apiContent: contentapi.Content): Fields = {
    Fields (
      trailText = apiContent.fields.flatMap(_.trailText),
      linkText = apiContent.webTitle,
      shortUrl = apiContent.fields.flatMap(_.shortUrl).getOrElse(""),
      standfirst = apiContent.fields.flatMap(_.standfirst),
      main = apiContent.fields.flatMap(_.main).getOrElse(""),
      body = apiContent.fields.flatMap(_.body).getOrElse(""),
      blocks = apiContent.blocks.map(Blocks.make),
      lastModified = apiContent.fields.flatMap(_.lastModified).map(_.toJoda).getOrElse(DateTime.now),
      displayHint = apiContent.fields.flatMap(_.displayHint).getOrElse(""),
      isLive = apiContent.fields.flatMap(_.liveBloggingNow).getOrElse(false),
      sensitive = apiContent.fields.flatMap(_.sensitive),
      shouldHideReaderRevenue = Some(shouldHideReaderRevenue(apiContent, shouldHideReaderRevenueCutoffDate)),
      legallySensitive = apiContent.fields.flatMap(_.legallySensitive),
      firstPublicationDate = apiContent.fields.flatMap(_.firstPublicationDate).map(_.toJoda),
      lang = apiContent.fields.flatMap(_.lang),
      shouldShowAffiliateLinks = apiContent.fields.flatMap(_.showAffiliateLinks).getOrElse(isAffiliateLinksSection(apiContent.section))
    )
  }

  def isAffiliateLinksSection(section: Option[contentapi.Section]): Boolean = {
    val sectionId = section.map(_.id).getOrElse("")
    Configuration.skimlinks.skimlinksSections.contains(sectionId)
  }

  def shouldHideReaderRevenue(apiContent: contentapi.Content, cutoffDate: DateTime): Boolean = {
    val publishedBeforeCutoff = apiContent.webPublicationDate.exists(_.toJoda < cutoffDate)
    val isPaidContent = Tags.make(apiContent).isPaidContent
    val isSensitive = apiContent.fields.flatMap(_.sensitive).getOrElse(false)
    val shouldHideAdverts = apiContent.fields.flatMap(_.shouldHideAdverts).getOrElse(false)

    apiContent.fields.flatMap(_.shouldHideReaderRevenue) match {
      case _ if isPaidContent => true
      case Some(shouldHide) => shouldHide
      case None if publishedBeforeCutoff => isSensitive || shouldHideAdverts
      case None => false
    }
  }

  implicit val fieldsWrites: Writes[Fields] =  Json.writes[Fields]
}

final case class Fields(
  trailText: Option[String],
  linkText: String,
  shortUrl: String,
  standfirst: Option[String],
  main: String,
  body: String,
  blocks: Option[Blocks],
  lastModified: DateTime,
  displayHint: String,
  isLive: Boolean,
  sensitive: Option[Boolean],
  shouldHideReaderRevenue: Option[Boolean],
  legallySensitive: Option[Boolean],
  firstPublicationDate: Option[DateTime],
  lang: Option[String],
  shouldShowAffiliateLinks: Boolean
){
  lazy val shortUrlId = shortUrl.replaceFirst("^[a-zA-Z]+://gu.com", "") //removing scheme://gu.com
  lazy val isRightToLeftLang: Boolean = lang.contains("ar")



  def javascriptConfig: Map[String, JsValue] = {
    Map(
      "shortUrl" -> JsString(shortUrl),
      "shortUrlId" -> JsString(shortUrlId),
      "shouldHideReaderRevenue" -> JsBoolean(shouldHideReaderRevenue.getOrElse(false))
    )
  }
}

object MetaData {

  def make(
    id: String,
    section: Option[SectionId],
    webTitle: String,
    url: Option[String] = None,
    canonicalUrl: Option[String] = None,
    pillar: Option[Pillar] = None,
    designType: Option[DesignType] = None,
    shouldGoogleIndex: Boolean = true,
    pagination: Option[Pagination] = None,
    description: Option[String] = None,
    title: Option[String] = None,
    isFront: Boolean = false,
    isPressedPage: Boolean = false,
    contentType: Option[DotcomContentType] = None,
    adUnitSuffix: Option[String] = None,
    customSignPosting: Option[NavItem] = None,
    iosType: Option[String] = Some(DotcomContentType.Article.toString),
    javascriptConfigOverrides: Map[String, JsValue] = Map(),
    opengraphPropertiesOverrides: Map[String, String] = Map(),
    isHosted: Boolean = false,
    twitterPropertiesOverrides: Map[String, String] = Map(),
    commercial: Option[CommercialProperties] = None
  ): MetaData = {

    val resolvedUrl = url.getOrElse(s"/$id")
    MetaData(
      id = id,
      url = resolvedUrl,
      webUrl = s"${Configuration.site.host}$resolvedUrl",
      webTitle = webTitle,
      section = section,
      pillar = pillar,
      designType = designType,
      adUnitSuffix = adUnitSuffix getOrElse section.map(_.value).getOrElse(""),
      canonicalUrl = canonicalUrl,
      shouldGoogleIndex = shouldGoogleIndex,
      pagination = pagination,
      description = description,
      title = title,
      isFront = isFront,
      isPressedPage = isPressedPage,
      contentType = contentType,
      customSignPosting = customSignPosting,
      iosType = iosType,
      javascriptConfigOverrides = javascriptConfigOverrides,
      opengraphPropertiesOverrides = opengraphPropertiesOverrides,
      isHosted = isHosted,
      twitterPropertiesOverrides = twitterPropertiesOverrides,
      commercial = commercial
    )
  }

  def make(fields: Fields, apiContent: contentapi.Content): MetaData = {
    val id = apiContent.id
    val url = s"/$id"
    val maybeSectionId: Option[SectionId] = apiContent.section.map(SectionId.fromCapiSection)

    MetaData(
      id = id,
      url = url,
      webUrl = apiContent.webUrl,
      maybeSectionId,
      Pillar(apiContent),
      Some(apiContent.designType),
      webTitle = apiContent.webTitle,
      membershipAccess = apiContent.fields.flatMap(_.membershipAccess.map(_.name)),
      adUnitSuffix = maybeSectionId.map(_.value).getOrElse(""),
      description = apiContent.fields.flatMap(_.trailText),
      contentType = DotcomContentType(apiContent),
      cacheTime = {
        if (fields.isLive) CacheTime.LiveBlogActive
        else if (fields.lastModified > DateTime.now(fields.lastModified.getZone) - 1.hour) CacheTime.RecentlyUpdated
        else if (fields.lastModified > DateTime.now(fields.lastModified.getZone) - 24.hours) CacheTime.LastDayUpdated
        else CacheTime.NotRecentlyUpdated
      },
      isHosted = apiContent.isHosted,
      commercial = Some(CommercialProperties.fromContent(apiContent)),
      sensitive = fields.sensitive.getOrElse(false)
    )
  }
}

final case class MetaData (
  id: String,
  url: String,
  webUrl: String,
  section: Option[SectionId],
  pillar: Option[Pillar],
  designType: Option[DesignType],
  webTitle: String,
  adUnitSuffix: String,
  iosType: Option[String] = Some("Article"),
  pagination: Option[Pagination] = None,
  description: Option[String] = None,
  rssPath: Option[String] = None,
  contentType: Option[DotcomContentType] = None,
  shouldHideHeaderAndTopAds: Boolean = false,
  schemaType: Option[String] = None, // Must be one of... http://schema.org/docs/schemas.html
  cacheTime: CacheTime = CacheTime.Default,
  openGraphImages: Seq[String] = Seq(),
  membershipAccess: Option[String] = None,
  isFront: Boolean = false,
  isPressedPage: Boolean = false,
  hideUi: Boolean = false,
  canonicalUrl: Option[String] = None,
  shouldGoogleIndex: Boolean = true,
  title: Option[String] = None,
  customSignPosting: Option[NavItem] = None,
  javascriptConfigOverrides: Map[String, JsValue] = Map(),
  opengraphPropertiesOverrides: Map[String, String] = Map(),
  isHosted: Boolean = false,
  twitterPropertiesOverrides: Map[String, String] = Map(),
  contentWithSlimHeader: Boolean = false,
  commercial: Option[CommercialProperties],
  isNewRecipeDesign: Boolean = false,
  sensitive: Boolean = false
){
  val sectionId = section map (_.value) getOrElse ""
  private val fullAdUnitPath = AdUnitMaker.make(id, adUnitSuffix)

  def hasPageSkin(edition: Edition): Boolean = DfpAgent.hasPageSkin(fullAdUnitPath, this, edition)
  def hasPageSkinOrAdTestPageSkin(edition: Edition): Boolean = DfpAgent.hasPageSkinOrAdTestPageSkin(fullAdUnitPath, this, edition)

  def omitMPUsFromContainers(edition: Edition): Boolean = if (isPressedPage) {
    DfpAgent.omitMPUsFromContainers(id, edition)
  } else false

  val shouldBlockAnalytics: Boolean = id.contains("help/ng-interactive/2017/mar/17/contact-the-guardian-securely")

  val requiresMembershipAccess: Boolean = membershipAccess.nonEmpty

  val hasSlimHeader: Boolean =
    contentWithSlimHeader ||
      (sectionId == "identity" && !id.startsWith("/user/")) ||
      contentType.exists(c => c == DotcomContentType.Survey || c == DotcomContentType.Signup)

  // this is here so it can be included in analytics.
  // Basically it helps us understand the impact of changes and needs
  // to be an integral part of each page
  def buildNumber: String = ManifestData.build
  def revision: String = ManifestData.revision

  def javascriptConfig: Map[String, JsValue] = Map(
    ("pageId", JsString(id)),
    ("section", JsString(sectionId)),
    ("webTitle", JsString(webTitle)),
    ("adUnit", JsString(fullAdUnitPath)),
    ("buildNumber", JsString(buildNumber)),
    ("revisionNumber", JsString(revision)),
    ("isFront", JsBoolean(isFront)),
    ("contentType", JsString(contentType.map(_.name).getOrElse("")))
  )

  def opengraphProperties: Map[String, String] = {
    // keep the old og:url even once the migration happens, as facebook lose the share count otherwise
    def ogUrl = webUrl.replaceFirst("^https:", "http:")

    Map(
      "og:site_name" -> "the Guardian",
      "fb:app_id"    -> Configuration.facebook.appId,
      "og:type"      -> "website",
      "og:url"       -> ogUrl
    ) ++ (iosId("applinks") map (iosId => List(
      "al:ios:url" -> s"gnmguardian://$iosId",
      "al:ios:app_store_id" -> "409128287",
      "al:ios:app_name" -> "The Guardian"
    )) getOrElse Nil)
  }

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
    Guardian()) ++ iosType.map(_ => List(
    WebPage(webUrl, PotentialAction(target = "android-app://com.guardian/" + webUrl.replace("://", "/")))
  )).getOrElse(Nil)

  def iosId(referrer: String): Option[String] = iosType.map(iosType => s"$id?contenttype=$iosType&source=$referrer")

  /**
    * Content type, lowercased and with spaces removed.
    * This is used for Google Analytics, to be consistent with what the mobile apps do.
    */
  def normalisedContentType: String = StringUtils.remove(contentType.map(_.name.toLowerCase).getOrElse(""), ' ')
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

case class CommercialExpiryPage(id: String) extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id,
    section = Some(SectionId.fromId("global")),
    webTitle = "This page has been removed",
    shouldGoogleIndex = false
  )
}

case class GalleryPage(
  gallery: Gallery,
  related: RelatedContent,
  index: Int,
  trail: Boolean)(implicit request: RequestHeader) extends ContentPage {
  override lazy val item = gallery
}

case class EmbedPage(item: Video, title: String, isExpired: Boolean = false) extends ContentPage

trait AtomPage extends Page {
  def atom: Atom
  def atomType: String
  def body: Html
  def withJavaScript: Boolean
  def withVerticalScrollbar: Boolean
  def javascriptModule: String = atomType
}

case class MediaAtomPage(
  override val atom: MediaAtom,
  override val withJavaScript: Boolean,
  override val withVerticalScrollbar: Boolean
)(implicit request: RequestHeader) extends AtomPage {
  override val atomType = "media"
  override val body = views.html.fragments.atoms.media(atom, displayCaption = false, mediaWrapper = Some(MediaWrapper.EmbedPage))
  override val javascriptModule = "youtube-embed"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.title,
    section = None
  )
}

case class StoryQuestionsAtomPage(
  override val atom: StoryQuestionsAtom,
  override val withJavaScript: Boolean,
  override val withVerticalScrollbar: Boolean,
  val inApp: Boolean
)(implicit request: RequestHeader) extends AtomPage {
  override val atomType = "storyquestions"
  override val body = views.html.fragments.atoms.storyquestions(atom, isAmp = false, inApp = inApp)
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.atom.title.getOrElse("Story questions"),
    section = None
  )
}

case class GuideAtomPage(
  override val atom: GuideAtom,
  override val withJavaScript: Boolean,
  override val withVerticalScrollbar: Boolean
)(implicit request: RequestHeader) extends AtomPage {
  override val atomType = "guide"
  override val body = views.html.fragments.atoms.snippets.guide(atom, isAmp = false)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.atom.title.getOrElse("Guide"),
    section = None
  )
}

case class ProfileAtomPage(
  override val atom: ProfileAtom,
  override val withJavaScript: Boolean,
  override val withVerticalScrollbar: Boolean
)(implicit request: RequestHeader) extends AtomPage {
  override val atomType = "profile"
  override val body = views.html.fragments.atoms.snippets.profile(atom, isAmp = false)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.atom.title.getOrElse("Profile"),
    section = None
  )
}

case class QandaAtomPage(
override val atom: QandaAtom,
override val withJavaScript: Boolean,
override val withVerticalScrollbar: Boolean
)(implicit request: RequestHeader) extends AtomPage {
  override val atomType = "qanda"
  override val body = views.html.fragments.atoms.snippets.qanda(atom, isAmp = false)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.atom.title.getOrElse("Q&A"),
    section = None
  )
}

case class TimelineAtomPage(
override val atom: TimelineAtom,
override val withJavaScript: Boolean,
override val withVerticalScrollbar: Boolean
)(implicit request: RequestHeader) extends AtomPage {
  override val atomType = "timeline"
  override val body = views.html.fragments.atoms.snippets.timeline(atom, isAmp = false)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.atom.title.getOrElse("Timeline"),
    section = None
  )
}

case class TagCombiner(
  id: String,
  leftTag: Tag,
  rightTag: Tag,
  pagination: Option[Pagination] = None
) extends StandalonePage {

  override val metadata: MetaData = MetaData.make(
    id = id,
    section = leftTag.metadata.section,
    webTitle = s"${leftTag.name} + ${rightTag.name}",
    pagination = pagination,
    description = Some(DotcomContentType.TagIndex.toString),
    commercial = Some(
      //We only use the left tag for CommercialProperties
      CommercialProperties(
        editionBrandings = leftTag.properties.commercial.map(_.editionBrandings).getOrElse(Set.empty),
        editionAdTargetings = leftTag.properties.commercial.map(_.editionAdTargetings).getOrElse(Set.empty),
        prebidIndexSites = leftTag.properties.commercial.flatMap(_.prebidIndexSites)
      )
    )
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
  def make(apiContent: contentapi.Content): Elements = {
    Elements(apiContent.elements
      .map(_.zipWithIndex.map { case (element, index) => Element(element, index) })
      .getOrElse(Nil))
  }
}
final case class Elements(elements: Seq[Element]) {
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

  lazy val hasMainMedia: Boolean = hasMainPicture || hasMainVideo || hasMainEmbed || hasMainAudio

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
  tags: List[Tag]) {

  def contributorAvatar: Option[String] = tags.flatMap(_.contributorImagePath).headOption

  private def tagsOfType(tagType: String): List[Tag] = tags.filter(_.properties.tagType == tagType)

  private def tagsOfTypeOrPaidContentSubtype(tagType: String, paidContentSubType: String): List[Tag] = {
    tags.filter { tag =>
      tag.properties.tagType == tagType ||
      (tag.properties.tagType == "PaidContent" && tag.properties.paidContentType.contains(paidContentSubType))
    }
  }

  lazy val keywords: List[Tag] = tagsOfTypeOrPaidContentSubtype("Keyword", "Topic")

  lazy val nonKeywordTags: List[Tag] = tags.diff(keywords)

  lazy val contributors: List[Tag] = tagsOfType("Contributor")
  lazy val isContributorPage: Boolean = contributors.nonEmpty
  lazy val series: List[Tag] = tagsOfTypeOrPaidContentSubtype("Series", "Series")
  lazy val blogs: List[Tag] = tagsOfType("Blog")
  lazy val tones: List[Tag] = tagsOfType("Tone")
  lazy val types: List[Tag] = tagsOfType("Type")
  lazy val tracking: List[Tag] = tagsOfType("Tracking")
  lazy val paidContent: List[Tag] = tagsOfType("PaidContent")

  lazy val richLink: Option[String] = tags.flatMap(_.richLinkId).headOption

  // Tones are all considered to be 'News' it is the default so we do not list news tones explicitly
  def isNews: Boolean = !(isLiveBlog || isComment || isFeature)

  lazy val isLiveBlog: Boolean = tones.exists(t => Tags.liveMappings.contains(t.id))
  lazy val isComment = tones.exists(t => Tags.commentMappings.contains(t.id))
  lazy val isFeature = tones.exists(t => Tags.featureMappings.contains(t.id))
  lazy val isInterview = tones.exists(t => Tags.interviewMappings.contains(t.id))
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
  lazy val isQuiz = tones.exists(_.id == Tags.quizzes)

  lazy val isArticle: Boolean = tags.exists { _.id == Tags.Article }
  lazy val isSudoku: Boolean = tags.exists { _.id == Tags.Sudoku } || tags.exists(t => t.id == "lifeandstyle/series/sudoku")
  lazy val isGallery: Boolean = tags.exists { _.id == Tags.Gallery }
  lazy val isVideo: Boolean = tags.exists { _.id == Tags.Video }
  lazy val isPoll: Boolean = tags.exists { _.id == Tags.Poll }
  lazy val isImageContent: Boolean = tags.exists { tag => List("type/cartoon", "type/picture", "type/graphic").contains(tag.id) }
  lazy val isInteractive: Boolean = tags.exists { _.id == Tags.Interactive }

  lazy val hasLargeContributorImage: Boolean = tagsOfType("Contributor").exists(_.properties.contributorLargeImagePath.nonEmpty)

  lazy val isCricketLiveBlog = isLiveBlog &&
    tags.map(_.id).exists(tagId => CricketTeams.teamTagIds.contains(tagId)) &&
    tags.map(_.id).contains("sport/over-by-over-reports")

  lazy val isRugbyMatch = (isMatchReport || isLiveBlog) &&
    tags.exists(t => t.id == "sport/rugby-union")

  lazy val isClimateChangeSeries = tags.exists(t => t.id =="environment/series/keep-it-in-the-ground")
  lazy val isTheMinuteArticle = tags.exists(t => t.id == "tone/minute")
  //this is for the immersive header to access this info
  lazy val isPaidContent = tags.exists( t => t.id == "tone/advertisement-features" )

  lazy val hasSuperStickyBanner = PersonalInvestmentsCampaign.isRunning(keywordIds)

  lazy val keywordIds = keywords.map { _.id }

  lazy val commissioningDesks = tracking.map(_.id).collect { case Tags.CommissioningDesk(desk) => desk }

  def javascriptConfig: Map[String, JsValue] = Map(
    ("keywords", JsString(keywords.map { _.name }.mkString(","))),
    ("keywordIds", JsString(keywordIds.mkString(","))),
    ("hasSuperStickyBanner", JsBoolean(hasSuperStickyBanner)),
    ("nonKeywordTagIds", JsString(nonKeywordTags.map { _.id }.mkString(","))),
    ("richLink", JsString(richLink.getOrElse(""))),
    ("author", JsString(contributors.map(_.name).mkString(","))),
    ("authorIds", JsString(contributors.map(_.id).mkString(","))),
    ("tones", JsString(tones.map(_.name).mkString(","))),
    ("toneIds", JsString(tones.map(_.id).mkString(","))),
    ("blogs", JsString(blogs.map { _.name }.mkString(","))),
    ("blogIds", JsString(blogs.map(_.id).mkString(","))),
    ("commissioningDesks", JsString(commissioningDesks.mkString(",")))
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
  val quizzes = "tone/quizzes"
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
    "tone/performances",
    "tone/extract",
    "tone/reviews",
    "tone/albumreview",
    "tone/livereview",
    "tone/childrens-user-reviews"
  )

  val interviewMappings = Seq(
    "tone/interview"
  )

  val reviewMappings = Seq(
    "tone/reviews"
  )

  val CommissioningDesk = """tracking/commissioningdesk/(.*)""".r

  def make(apiContent: contentapi.Content): Tags = {
    Tags(apiContent.tags.toList map { Tag.make(_) })
  }
}
