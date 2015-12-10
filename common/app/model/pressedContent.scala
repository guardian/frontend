package model.pressed

import com.gu.facia.api.{utils => fapiutils}
import com.gu.facia.api.{models => fapi}
import com.gu.facia.client.models.CollectionConfigJson
import fapiutils.FaciaContentUtils
import model.{SupportedUrl, ContentType}
import org.joda.time.DateTime
import play.api.libs.json._

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

  implicit val collectionConfigFormat = Json.format[CollectionConfig]
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

  implicit object CardStyleFormat extends Format[CardStyle] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("SpecialReport"), _) => JsSuccess(SpecialReport)
        case JsSuccess(JsString("LiveBlog"), _) => JsSuccess(LiveBlog)
        case JsSuccess(JsString("DeadBlog"), _) => JsSuccess(DeadBlog)
        case JsSuccess(JsString("Feature"), _) => JsSuccess(Feature)
        case JsSuccess(JsString("Editorial"), _) => JsSuccess(Editorial)
        case JsSuccess(JsString("Comment"), _) =>  JsSuccess(Comment)
        case JsSuccess(JsString("Media"), _) => JsSuccess(Media)
        case JsSuccess(JsString("Analysis"), _) => JsSuccess(Analysis)
        case JsSuccess(JsString("Review"), _) => JsSuccess(Review)
        case JsSuccess(JsString("Letters"), _) => JsSuccess(Letters)
        case JsSuccess(JsString("ExternalLink"), _) => JsSuccess(ExternalLink)
        case JsSuccess(JsString("DefaultCardstyle"), _) => JsSuccess(DefaultCardstyle)
        case _ => JsError("Could not convert ItemKicker")
      }
    }

    def writes(cardStyle: CardStyle) = cardStyle match {
      case SpecialReport => JsObject(Seq("type" -> JsString("SpecialReport")))
      case LiveBlog => JsObject(Seq("type" -> JsString("LiveBlog")))
      case DeadBlog => JsObject(Seq("type" -> JsString("DeadBlog")))
      case Feature => JsObject(Seq("type" -> JsString("Feature")))
      case Editorial => JsObject(Seq("type" -> JsString("Editorial")))
      case Comment => JsObject(Seq("type" -> JsString("Comment")))
      case Media => JsObject(Seq("type" -> JsString("Media")))
      case Analysis => JsObject(Seq("type" -> JsString("Analysis")))
      case Review => JsObject(Seq("type" -> JsString("Review")))
      case Letters => JsObject(Seq("type" -> JsString("Letters")))
      case ExternalLink => JsObject(Seq("type" -> JsString("ExternalLink")))
      case DefaultCardstyle => JsObject(Seq("type" -> JsString("DefaultCardstyle")))
    }
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
      imageHide = contentProperties.imageHide,
      showMainVideo = contentProperties.showMainVideo,
      showKickerTag = contentProperties.showKickerTag,
      showByline = contentProperties.showByline,
      imageSlideshowReplace = contentProperties.imageSlideshowReplace,
      maybeContent = capiContent.map(model.Content(_)),
      maybeContentId = FaciaContentUtils.maybeContentId(content),
      id = FaciaContentUtils.id(content),
      kicker = FaciaContentUtils.itemKicker(content).map(ItemKicker.make),
      headline = FaciaContentUtils.headline(content),
      cardStyle = CardStyle.make(FaciaContentUtils.cardStyle(content)),
      isCommentable = FaciaContentUtils.isCommentable(content),
      isClosedForComments = FaciaContentUtils.isClosedForComments(content),
      discussionId = FaciaContentUtils.discussionId(content),
      isBoosted = FaciaContentUtils.isBoosted(content),
      showBoostedHeadline = FaciaContentUtils.showBoostedHeadline(content),
      showQuotedHeadline = FaciaContentUtils.showQuotedHeadline(content),
      showLivePlayable = FaciaContentUtils.showLivePlayable(content),
      isLiveBlog = FaciaContentUtils.isLiveBlog(content),
      isVideo = FaciaContentUtils.isVideo(content),
      isAudio = FaciaContentUtils.isAudio(content),
      isGallery = FaciaContentUtils.isGallery(content),
      isCrossword = FaciaContentUtils.isCrossword(content),
      isLive = FaciaContentUtils.isLive(content),
      seriesOrBlogKicker = capiContent.flatMap(item =>
        fapiutils.ItemKicker.seriesOrBlogKicker(item).map(ItemKicker.makeTagKicker)),
      byline = FaciaContentUtils.byline(content),
      image = FaciaContentUtils.image(content).map(Image.make),
      url = capiContent.map(SupportedUrl(_)).getOrElse(FaciaContentUtils.id(content)),
      maybeSection = FaciaContentUtils.maybeSection(content),
      webPublicationDateOption = FaciaContentUtils.webPublicationDateOption(content),
      webTitle = FaciaContentUtils.webTitle(content),
      linkText = FaciaContentUtils.linkText(content),
      embedType = FaciaContentUtils.embedType(content),
      embedCss = FaciaContentUtils.embedCss(content),
      embedUri = FaciaContentUtils.embedUri(content),
      mediaType = fapiutils.MediaType.fromFaciaContent(content).map(MediaType.make),
      shortUrl = FaciaContentUtils.shortUrl(content),
      shortUrlPath = FaciaContentUtils.shortUrlPath(content),
      section = FaciaContentUtils.section(content),
      group = FaciaContentUtils.group(content),
      trailText = FaciaContentUtils.trailText(content),
      starRating = FaciaContentUtils.starRating(content),
      maybeFrontPublicationDate = FaciaContentUtils.maybeFrontPublicationDate(content),
      href = FaciaContentUtils.href(content)
    )
  }

  private def getProperties(content: fapi.FaciaContent): fapiutils.ContentProperties = {
    content match {
      case curatedContent: fapi.CuratedContent => curatedContent.properties
      case supportingCuratedContent: fapi.SupportingCuratedContent => supportingCuratedContent.properties
      case linkSnap: fapi.LinkSnap => linkSnap.properties
      case latestSnap: fapi.LatestSnap => latestSnap.properties
    }
  }

  implicit object pressedPropertiesFormat extends Format[PressedProperties] {
    def reads(json: JsValue) = ???
    def writes(properties: PressedProperties) = ???
  }
}
final case class PressedProperties(
  isBreaking: Boolean,
  imageHide: Boolean,
  showMainVideo: Boolean,
  showKickerTag: Boolean,
  showByline: Boolean,
  imageSlideshowReplace: Boolean,
  maybeContent: Option[ContentType],
  maybeContentId: Option[String],
  id: String,
  kicker: Option[ItemKicker],
  headline: String,
  cardStyle: CardStyle,
  isCommentable: Boolean,
  isClosedForComments: Boolean,
  discussionId: Option[String],
  isBoosted: Boolean,
  showBoostedHeadline: Boolean,
  showQuotedHeadline: Boolean,
  showLivePlayable: Boolean,
  isLiveBlog: Boolean,
  isVideo: Boolean,
  isAudio: Boolean,
  isGallery: Boolean,
  isCrossword: Boolean,
  isLive: Boolean,
  seriesOrBlogKicker: Option[TagKicker],
  byline: Option[String],
  image: Option[Image],
  url: String,
  maybeSection: Option[String],
  webPublicationDateOption: Option[DateTime],
  webTitle: String,
  linkText: Option[String],
  embedType: Option[String],
  embedCss: Option[String],
  embedUri: Option[String],
  mediaType: Option[MediaType],
  shortUrl: String,
  shortUrlPath: Option[String],
  section: String,
  group: String,
  trailText: Option[String],
  starRating: Option[Int],
  maybeFrontPublicationDate: Option[Long],
  href: Option[String]
)

object PressedContent {
  def make(content: fapi.FaciaContent): PressedContent = {
    val properties = PressedProperties.make(content)

    content match {
      case curatedContent: fapi.CuratedContent => CuratedContent.make(curatedContent, properties)
      case supportingCuratedContent: fapi.SupportingCuratedContent => SupportingCuratedContent.make(supportingCuratedContent, properties)
      case linkSnap: fapi.LinkSnap => LinkSnap.make(linkSnap, properties)
      case latestSnap: fapi.LatestSnap => LatestSnap.make(latestSnap, properties)
    }
  }

  implicit object faciaContentFormat extends Format[PressedContent] {
    def reads(json: JsValue) = (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("LinkSnap"), _) => JsSuccess(json.as[LinkSnap](linkSnapFormat))
      case JsSuccess(JsString("LatestSnap"), _) => JsSuccess(json.as[LatestSnap](latestSnapFormat))
      case JsSuccess(JsString("CuratedContent"), _) => JsSuccess(json.as[CuratedContent](curatedContentFormat))
      case JsSuccess(JsString("SupportingCuratedContent"), _) => JsSuccess(json.as[SupportingCuratedContent](supportingCuratedContentFormat))
      case _ => JsError("Could not convert FaciaContent")
    }

    def writes(faciaContent: PressedContent) = faciaContent match {
      case linkSnap: LinkSnap => Json.toJson(linkSnap)(linkSnapFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "LinkSnap")
        case JsError(_) => JsNull
      }
      case latestSnap: LatestSnap => Json.toJson(latestSnap)(latestSnapFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "LatestSnap")
        case JsError(_) => JsNull
      }
      case content: CuratedContent => Json.toJson(content)(curatedContentFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "CuratedContent")
        case JsError(_) => JsNull
      }
      case supportingContent: SupportingCuratedContent => Json.toJson(supportingContent)(supportingCuratedContentFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "SupportingCuratedContent")
        case JsError(_) => JsNull
      }
      case _ => JsNull
    }
  }

  private val latestSnapFormat = Json.format[LatestSnap]
  private val linkSnapFormat = Json.format[LinkSnap]
  private val curatedContentFormat = Json.format[CuratedContent]
  private val supportingCuratedContentFormat = Json.format[SupportingCuratedContent]
}

sealed trait PressedContent {
  def properties: PressedProperties
}
sealed trait Snap extends PressedContent

object CuratedContent {
  def make(content: fapi.CuratedContent, properties: PressedProperties): CuratedContent = {
    CuratedContent(
      properties = properties,
      supportingContent = content.supportingContent.map(PressedContent.make),
      cardStyle = CardStyle.make(content.cardStyle)
    )
  }
}
final case class CuratedContent(
  override val properties: PressedProperties,
  supportingContent: List[PressedContent],
  cardStyle: CardStyle ) extends PressedContent

object SupportingCuratedContent {
  def make(content: fapi.SupportingCuratedContent, properties: PressedProperties): SupportingCuratedContent = {
    SupportingCuratedContent(
      properties = properties,
      cardStyle = CardStyle.make(content.cardStyle)
    )
  }
}
final case class SupportingCuratedContent(
  override val properties: PressedProperties,
  cardStyle: CardStyle) extends PressedContent

object LinkSnap {
  def make(content: fapi.LinkSnap, properties: PressedProperties): LinkSnap = {
    LinkSnap(
      properties = properties,
      snapUri = content.snapUri
    )
  }
}
final case class LinkSnap(
  override val properties: PressedProperties,
  snapUri: Option[String]) extends Snap

object LatestSnap {
  def make(content: fapi.LatestSnap, properties: PressedProperties): LatestSnap = {
    LatestSnap(
      properties = properties,
      cardStyle = CardStyle.make(content.cardStyle),
      snapUri = content.snapUri
    )
  }
}
final case class LatestSnap(
  override val properties: PressedProperties,
  cardStyle: CardStyle,
  snapUri: Option[String]) extends Snap

object KickerProperties {
  def make(kicker: fapiutils.ItemKicker): KickerProperties = KickerProperties(fapiutils.ItemKicker.kickerText(kicker))
  implicit val kickerPropertiesFormat = Json.format[KickerProperties]
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

  implicit val seriesFormat = Json.format[Series]
  private val podcastKickerFormat = Json.format[PodcastKicker]
  private val tagKickerFormat = Json.format[TagKicker]
  private val sectionKickerFormat = Json.format[SectionKicker]
  private val freeHtmlKickerFormat = Json.format[FreeHtmlKicker]
  private val freeHtmlKickerWithLinkFormat = Json.format[FreeHtmlKickerWithLink]

  implicit object itemKickerFormat extends Format[ItemKicker] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("BreakingNewsKicker"), _) => JsSuccess(BreakingNewsKicker)
        case JsSuccess(JsString("LiveKicker"), _) => JsSuccess(LiveKicker)
        case JsSuccess(JsString("AnalysisKicker"), _) => JsSuccess(AnalysisKicker)
        case JsSuccess(JsString("ReviewKicker"), _) => JsSuccess(ReviewKicker)
        case JsSuccess(JsString("CartoonKicker"), _) => JsSuccess(CartoonKicker)
        case JsSuccess(JsString("PodcastKicker"), _) =>  (json \ "series").validate[PodcastKicker](podcastKickerFormat)
        case JsSuccess(JsString("TagKicker"), _) => (json \ "item").validate[TagKicker](tagKickerFormat)
        case JsSuccess(JsString("SectionKicker"), _) => (json \ "item").validate[SectionKicker](sectionKickerFormat)
        case JsSuccess(JsString("FreeHtmlKicker"), _) => (json \ "item").validate[FreeHtmlKicker](freeHtmlKickerFormat)
        case JsSuccess(JsString("FreeHtmlKickerWithLink"), _) => (json \ "item").validate[FreeHtmlKickerWithLink](freeHtmlKickerWithLinkFormat)
        case _ => JsError("Could not convert ItemKicker")
      }
    }

    def writes(itemKicker: ItemKicker) = itemKicker match {
      case BreakingNewsKicker => JsObject(Seq("type" -> JsString("BreakingNewsKicker")))
      case LiveKicker => JsObject(Seq("type" -> JsString("LiveKicker")))
      case AnalysisKicker => JsObject(Seq("type" -> JsString("AnalysisKicker")))
      case ReviewKicker => JsObject(Seq("type" -> JsString("ReviewKicker")))
      case CartoonKicker => JsObject(Seq("type" -> JsString("CartoonKicker")))
      case podcastKicker: PodcastKicker => JsObject(Seq("type" -> JsString("PodcastKicker"), "series" -> Json.toJson(podcastKicker)(podcastKickerFormat)))
      case tagKicker: TagKicker => JsObject(Seq("type" -> JsString("TagKicker"), "item" -> Json.toJson(tagKicker)(tagKickerFormat)))
      case sectionKicker: SectionKicker => JsObject(Seq("type" -> JsString("SectionKicker"), "item" -> Json.toJson(sectionKicker)(sectionKickerFormat)))
      case freeHtmlKicker: FreeHtmlKicker => JsObject(Seq("type" -> JsString("FreeHtmlKicker"), "item" -> Json.toJson(freeHtmlKicker)(freeHtmlKickerFormat)))
      case freeHtmlKickerWithLink: FreeHtmlKickerWithLink => JsObject(Seq("type" -> JsString("FreeHtmlKickerWithLink"), "item" -> Json.toJson(freeHtmlKickerWithLink)(freeHtmlKickerWithLinkFormat)))
    }
  }
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

  implicit object faciaImageFormat extends Format[Image] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("Cutout"), _) => (json \ "item").validate[Cutout](Cutout.cutoutFormat)
        case JsSuccess(JsString("Replace"), _) => (json \ "item").validate[Replace](Replace.replaceFormat)
        case JsSuccess(JsString("ImageSlideshow"), _) => (json \ "item").validate[ImageSlideshow](ImageSlideshow.slideshowFormat)
        case _ => JsError("Could not convert ItemKicker")
      }
    }

    def writes(faciaImage: Image) = faciaImage match {
      case cutout: Cutout => JsObject(Seq("type" -> JsString("Cutout"), "item" -> Json.toJson(cutout)(Cutout.cutoutFormat)))
      case replace: Replace => JsObject(Seq("type" -> JsString("Replace"), "item" -> Json.toJson(replace)(Replace.replaceFormat)))
      case imageSlideshow: ImageSlideshow => JsObject(Seq("type" -> JsString("ImageSlideshow"), "item" -> Json.toJson(imageSlideshow)(ImageSlideshow.slideshowFormat)))
    }
  }
}
sealed trait Image

object Cutout {
  def make(cutout: fapi.Cutout): Cutout = Cutout(
      imageSrc = cutout.imageSrc,
      imageSrcHeight = cutout.imageSrcHeight,
      imageSrcWidth = cutout.imageSrcWidth)

  implicit val cutoutFormat = Json.format[Cutout]
}
final case class Cutout(imageSrc: String, imageSrcWidth: Option[String], imageSrcHeight: Option[String]) extends Image

object Replace {
  def make(replace: fapi.Replace): Replace = Replace(
      imageSrc = replace.imageSrc,
      imageSrcHeight = replace.imageSrcHeight,
      imageSrcWidth = replace.imageSrcWidth)

  implicit val replaceFormat = Json.format[Replace]
}
final case class Replace(imageSrc: String, imageSrcWidth: String, imageSrcHeight: String) extends Image

object ImageSlideshow {
  def make(slideshow: fapi.ImageSlideshow): ImageSlideshow = ImageSlideshow(
    assets = slideshow.assets.map(Replace.make)
  )
  implicit val slideshowFormat = Json.format[ImageSlideshow]
}
final case class ImageSlideshow(assets: List[Replace]) extends Image
