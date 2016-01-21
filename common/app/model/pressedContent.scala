package model.pressed

import com.gu.facia.api.{utils => fapiutils}
import com.gu.facia.api.{models => fapi}
import com.gu.facia.client.models.CollectionConfigJson
import fapiutils.FaciaContentUtils
import model.{SupportedUrl, ContentType}
import org.joda.time.DateTime

object CollectionConfig {
  def make(config: fapi.CollectionConfig): CollectionConfig = {
    CollectionConfig(
      displayName = config.displayName,
      apiQuery = config.apiQuery,
      collectionType = config.collectionType,
      href = config.href,
      description = config.description,
      groups = config.groups.map(_.groups),
      uneditable = config.uneditable,
      showTags = config.showTags,
      showSections = config.showSections,
      hideKickers = config.hideKickers,
      showDateHeader = config.showDateHeader,
      showLatestUpdate = config.showLatestUpdate,
      excludeFromRss = config.excludeFromRss,
      showTimestamps = config.showTimestamps,
      hideShowMore = config.hideShowMore
    )
  }

  def make(collectionJson: CollectionConfigJson): CollectionConfig = {
    CollectionConfig.make(fapi.CollectionConfig.fromCollectionJson(collectionJson))
  }

  val empty = make(fapi.CollectionConfig.empty)
}
final case class CollectionConfig(
  displayName: Option[String],
  apiQuery: Option[String],
  collectionType: String,
  href: Option[String],
  description: Option[String],
  groups: Option[List[String]],
  uneditable: Boolean,
  showTags: Boolean,
  showSections: Boolean,
  hideKickers: Boolean,
  showDateHeader: Boolean,
  showLatestUpdate: Boolean,
  excludeFromRss: Boolean,
  showTimestamps: Boolean,
  hideShowMore: Boolean
)

object CardStyle {
  def make(cardStyle: fapiutils.CardStyle): CardStyle = cardStyle match {
    case fapiutils.SpecialReport => SpecialReport
    case fapiutils.LiveBlog => LiveBlog
    case fapiutils.DeadBlog => DeadBlog
    case fapiutils.Feature => Feature
    case fapiutils.Editorial => Editorial
    case fapiutils.Comment => Comment
    case fapiutils.Media => Media
    case fapiutils.Analysis => Analysis
    case fapiutils.Review => Review
    case fapiutils.Letters => Letters
    case fapiutils.ExternalLink => ExternalLink
    case fapiutils.DefaultCardstyle  => DefaultCardstyle
  }
}
sealed trait CardStyle {
  def toneString: String
}
case object SpecialReport extends CardStyle { val toneString = fapiutils.CardStyle.specialReport }
case object LiveBlog extends CardStyle { val toneString = fapiutils.CardStyle.live }
case object DeadBlog extends CardStyle { val toneString = fapiutils.CardStyle.dead }
case object Feature extends CardStyle { val toneString = fapiutils.CardStyle.feature }
case object Editorial extends CardStyle { val toneString = fapiutils.CardStyle.editorial }
case object Comment extends CardStyle { val toneString = fapiutils.CardStyle.comment }
case object Media extends CardStyle { val toneString = fapiutils.CardStyle.media }
case object Analysis extends CardStyle { val toneString = fapiutils.CardStyle.analysis }
case object Review extends CardStyle { val toneString = fapiutils.CardStyle.review }
case object Letters extends CardStyle { val toneString = fapiutils.CardStyle.letters }
case object ExternalLink extends CardStyle { val toneString = fapiutils.CardStyle.external }
case object DefaultCardstyle extends CardStyle { val toneString = fapiutils.CardStyle.news }

object MediaType {
  def make(mediaType: fapiutils.MediaType): MediaType = mediaType match {
    case fapiutils.Video => Video
    case fapiutils.Gallery => Gallery
    case fapiutils.Audio => Audio
  }
}
sealed trait MediaType
case object Gallery extends MediaType
case object Video extends MediaType
case object Audio extends MediaType

object PressedProperties {
  def make(content: fapi.FaciaContent): PressedProperties = {
    val contentProperties = getProperties(content)
    val capiContent = FaciaContentUtils.maybeContent(content)

    PressedProperties(
      isBreaking = contentProperties.isBreaking,
      showMainVideo = contentProperties.showMainVideo,
      showKickerTag = contentProperties.showKickerTag,
      showByline = contentProperties.showByline,
      imageSlideshowReplace = contentProperties.imageSlideshowReplace,
      maybeContent = capiContent.map(model.Content(_)),
      maybeContentId = FaciaContentUtils.maybeContentId(content),
      isLiveBlog = FaciaContentUtils.isLiveBlog(content),
      isCrossword = FaciaContentUtils.isCrossword(content),
      byline = FaciaContentUtils.byline(content),
      image = FaciaContentUtils.image(content).map(Image.make),
      maybeSection = FaciaContentUtils.maybeSection(content),
      webTitle = FaciaContentUtils.webTitle(content),
      linkText = FaciaContentUtils.linkText(content),
      embedType = FaciaContentUtils.embedType(content),
      embedCss = FaciaContentUtils.embedCss(content),
      embedUri = FaciaContentUtils.embedUri(content),
      section = FaciaContentUtils.section(content),
      maybeFrontPublicationDate = FaciaContentUtils.maybeFrontPublicationDate(content),
      href = FaciaContentUtils.href(content),
      webUrl = FaciaContentUtils.webUrl(content)
    )
  }

  def getProperties(content: fapi.FaciaContent): fapiutils.ContentProperties = {
    content match {
      case curatedContent: fapi.CuratedContent => curatedContent.properties
      case supportingCuratedContent: fapi.SupportingCuratedContent => supportingCuratedContent.properties
      case linkSnap: fapi.LinkSnap => linkSnap.properties
      case latestSnap: fapi.LatestSnap => latestSnap.properties
    }
  }
}

final case class PressedProperties(
  isBreaking: Boolean,
  showMainVideo: Boolean,
  showKickerTag: Boolean,
  showByline: Boolean,
  imageSlideshowReplace: Boolean,
  maybeContent: Option[ContentType],
  maybeContentId: Option[String],
  isLiveBlog: Boolean,
  isCrossword: Boolean,
  byline: Option[String],
  image: Option[Image],
  maybeSection: Option[String],
  webTitle: String,
  linkText: Option[String],
  embedType: Option[String],
  embedCss: Option[String],
  embedUri: Option[String],
  section: String,
  maybeFrontPublicationDate: Option[Long],
  href: Option[String],
  webUrl: Option[String]
)

object PressedCardHeader {
  def make(content: fapi.FaciaContent): PressedCardHeader = {
    val capiContent = FaciaContentUtils.maybeContent(content)
    PressedCardHeader(
      kicker = FaciaContentUtils.itemKicker(content).map(ItemKicker.make),
      headline = FaciaContentUtils.headline(content),
      isVideo = FaciaContentUtils.isVideo(content),
      isComment = FaciaContentUtils.isComment(content),
      isAudio = FaciaContentUtils.isAudio(content),
      isGallery = FaciaContentUtils.isGallery(content),
      seriesOrBlogKicker = capiContent.flatMap(item =>
        fapiutils.ItemKicker.seriesOrBlogKicker(item).map(ItemKicker.makeTagKicker)),
      url = capiContent.map(SupportedUrl(_)).getOrElse(FaciaContentUtils.id(content))
    )
  }
}

final case class PressedCardHeader(
  isVideo: Boolean,
  isComment: Boolean,
  isGallery: Boolean,
  isAudio: Boolean,
  kicker: Option[ItemKicker],
  seriesOrBlogKicker: Option[TagKicker],
  headline: String,
  url: String
)

object PressedDisplaySettings {
  def make(content: fapi.FaciaContent): PressedDisplaySettings = {
    val contentProperties = PressedProperties.getProperties(content)
    PressedDisplaySettings(
      imageHide = contentProperties.imageHide,
      isBoosted = FaciaContentUtils.isBoosted(content),
      showBoostedHeadline = FaciaContentUtils.showBoostedHeadline(content),
      showQuotedHeadline = FaciaContentUtils.showQuotedHeadline(content),
      showLivePlayable = FaciaContentUtils.showLivePlayable(content)
    )
  }
}

final case class PressedDisplaySettings(
  isBoosted: Boolean,
  showBoostedHeadline: Boolean,
  showQuotedHeadline: Boolean,
  imageHide: Boolean,
  showLivePlayable: Boolean
)

object PressedDiscussionSettings {
  def make(content: fapi.FaciaContent): PressedDiscussionSettings = PressedDiscussionSettings(
    isCommentable = FaciaContentUtils.isCommentable(content),
    isClosedForComments = FaciaContentUtils.isClosedForComments(content),
    discussionId = FaciaContentUtils.discussionId(content)
  )
}

final case class PressedDiscussionSettings(
  isCommentable: Boolean,
  isClosedForComments: Boolean,
  discussionId: Option[String]
)

object PressedCard {
  def make(content: fapi.FaciaContent): PressedCard = PressedCard(
    id = FaciaContentUtils.id(content),
    cardStyle = CardStyle.make(FaciaContentUtils.cardStyle(content)),
    isLive = FaciaContentUtils.isLive(content),
    webPublicationDateOption = FaciaContentUtils.webPublicationDateOption(content),
    mediaType = fapiutils.MediaType.fromFaciaContent(content).map(MediaType.make),
    shortUrl = FaciaContentUtils.shortUrl(content),
    shortUrlPath = FaciaContentUtils.shortUrlPath(content),
    group = FaciaContentUtils.group(content),
    trailText = FaciaContentUtils.trailText(content),
    starRating = FaciaContentUtils.starRating(content)
  )
}

final case class PressedCard(
  id: String,
  cardStyle: CardStyle,
  webPublicationDateOption: Option[DateTime],
  trailText: Option[String],
  mediaType: Option[MediaType],
  starRating: Option[Int],
  shortUrlPath: Option[String],
  shortUrl: String,
  group: String,
  isLive: Boolean
)

// EnrichedContent is an optionally-present field of the PressedContent class.
// It contains additional content that has been pre-fetched by facia-press, to
// enable facia-server-side rendering of FAPI content, such as embeds.
final case class EnrichedContent(
  embedHtml: Option[String]
)

object EnrichedContent {
  val empty = EnrichedContent(None)
}

object PressedContent {
  def make(content: fapi.FaciaContent): PressedContent = content match {
    case curatedContent: fapi.CuratedContent => CuratedContent.make(curatedContent)
    case supportingCuratedContent: fapi.SupportingCuratedContent => SupportingCuratedContent.make(supportingCuratedContent)
    case linkSnap: fapi.LinkSnap => LinkSnap.make(linkSnap)
    case latestSnap: fapi.LatestSnap => LatestSnap.make(latestSnap)
  }
}

sealed trait PressedContent {
  def properties: PressedProperties
  def header: PressedCardHeader
  def card: PressedCard
  def discussion: PressedDiscussionSettings
  def display: PressedDisplaySettings
}
sealed trait Snap extends PressedContent

object CuratedContent {
  def make(content: fapi.CuratedContent): CuratedContent = {
    CuratedContent(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content),
      supportingContent = content.supportingContent.map(PressedContent.make),
      cardStyle = CardStyle.make(content.cardStyle),
      enriched = Some(EnrichedContent.empty)
    )
  }
}
final case class CuratedContent(
  override val properties: PressedProperties,
  override val header: PressedCardHeader,
  override val card: PressedCard,
  override val discussion: PressedDiscussionSettings,
  override val display: PressedDisplaySettings,
  enriched: Option[EnrichedContent], // This is currently an option, as we introduce the new field. It can then become a value type.
  supportingContent: List[PressedContent],
  cardStyle: CardStyle ) extends PressedContent

object SupportingCuratedContent {
  def make(content: fapi.SupportingCuratedContent): SupportingCuratedContent = {
    SupportingCuratedContent(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content),
      cardStyle = CardStyle.make(content.cardStyle)
    )
  }
}
final case class SupportingCuratedContent(
  override val properties: PressedProperties,
  override val header: PressedCardHeader,
  override val card: PressedCard,
  override val discussion: PressedDiscussionSettings,
  override val display: PressedDisplaySettings,
  cardStyle: CardStyle) extends PressedContent

object LinkSnap {
  def make(content: fapi.LinkSnap): LinkSnap = {
    LinkSnap(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content)
    )
  }
}
final case class LinkSnap(
  override val properties: PressedProperties,
  override val header: PressedCardHeader,
  override val card: PressedCard,
  override val discussion: PressedDiscussionSettings,
  override val display: PressedDisplaySettings) extends Snap

object LatestSnap {
  def make(content: fapi.LatestSnap): LatestSnap = {
    LatestSnap(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content)
    )
  }
}
final case class LatestSnap(
  override val properties: PressedProperties,
  override val header: PressedCardHeader,
  override val card: PressedCard,
  override val discussion: PressedDiscussionSettings,
  override val display: PressedDisplaySettings) extends Snap

object KickerProperties {
  def make(kicker: fapiutils.ItemKicker): KickerProperties = KickerProperties(fapiutils.ItemKicker.kickerText(kicker))
}
final case class KickerProperties(
  kickerText: Option[String]
)

object ItemKicker {
  def make(kicker: fapiutils.ItemKicker): ItemKicker = {
    val properties = KickerProperties.make(kicker)
    kicker match {
      case fapiutils.BreakingNewsKicker => BreakingNewsKicker
      case fapiutils.LiveKicker => LiveKicker
      case fapiutils.AnalysisKicker => AnalysisKicker
      case fapiutils.ReviewKicker => ReviewKicker
      case fapiutils.CartoonKicker => CartoonKicker
      case fapiutils.PodcastKicker(series) => PodcastKicker(properties, Series.make(series))
      case fapiutils.TagKicker(name, url, id) => TagKicker(properties, name, url, id)
      case fapiutils.SectionKicker(name, url) => SectionKicker(properties, name, url)
      case fapiutils.FreeHtmlKicker(body) => FreeHtmlKicker(properties, body)
      case fapiutils.FreeHtmlKickerWithLink(body, url) => FreeHtmlKickerWithLink(properties, body, url)
    }
  }
  def makeTagKicker(kicker: fapiutils.TagKicker): TagKicker = TagKicker(
    properties = KickerProperties.make(kicker),
    name = kicker.name,
    url = kicker.url,
    id = kicker.id
  )
}
sealed trait ItemKicker {
  def properties: KickerProperties
}
case object BreakingNewsKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.BreakingNewsKicker)
}
case object LiveKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.LiveKicker)
}
case object AnalysisKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.AnalysisKicker)
}
case object ReviewKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.ReviewKicker)
}
case object CartoonKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.CartoonKicker)
}

final case class PodcastKicker(
  override val properties: KickerProperties,
  series: Option[Series]) extends ItemKicker

final case class TagKicker(
  override val properties: KickerProperties,
  name: String,
  url: String,
  id: String) extends ItemKicker

final case class SectionKicker(
  override val properties: KickerProperties,
  name: String,
  url: String) extends ItemKicker

final case class FreeHtmlKicker(
  override val properties: KickerProperties,
  body: String) extends ItemKicker

final case class FreeHtmlKickerWithLink(
  override val properties: KickerProperties,
  body: String,
  url: String) extends ItemKicker

object Series {
  def make(series: Option[fapiutils.Series]): Option[Series] = {
    series.map(series => Series(series.name, series.url))
  }
}
final case class Series(name: String, url: String)

object Image {
  def make(image: fapi.FaciaImage): Image = image match {
    case cutout: fapi.Cutout => Cutout.make(cutout)
    case replace: fapi.Replace => Replace.make(replace)
    case slideshow: fapi.ImageSlideshow => ImageSlideshow.make(slideshow)
  }
}
sealed trait Image

object Cutout {
  def make(cutout: fapi.Cutout): Cutout = Cutout(
      imageSrc = cutout.imageSrc,
      imageSrcHeight = cutout.imageSrcHeight,
      imageSrcWidth = cutout.imageSrcWidth)
}
final case class Cutout(imageSrc: String, imageSrcWidth: Option[String], imageSrcHeight: Option[String]) extends Image

object Replace {
  def make(replace: fapi.Replace): Replace = Replace(
      imageSrc = replace.imageSrc,
      imageSrcHeight = replace.imageSrcHeight,
      imageSrcWidth = replace.imageSrcWidth)
}
final case class Replace(imageSrc: String, imageSrcWidth: String, imageSrcHeight: String) extends Image

object ImageSlideshow {
  def make(slideshow: fapi.ImageSlideshow): ImageSlideshow = ImageSlideshow(
    assets = slideshow.assets.map(Replace.make)
  )
}
final case class ImageSlideshow(assets: List[Replace]) extends Image
