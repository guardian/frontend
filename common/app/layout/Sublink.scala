package layout

import cards.{MediaList, Standard}
import com.gu.commercial.branding.Branding
import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentapi.client.utils.DesignType
import common.Edition.defaultEdition
import common.{Edition, LinkTo}
import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper
import model._
import model.pressed._
import org.joda.time.DateTime
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import services.FaciaContentConvert
import views.support._

import scala.Function.const

object EditionalisedLink {
  def fromFaciaContent(faciaContent: PressedContent): EditionalisedLink =
    EditionalisedLink(SupportedUrl.fromFaciaContent(faciaContent))
}

case class EditionalisedLink(
  baseUrl: String
) {
  import common.LinkTo._

  def get(implicit requestHeader: RequestHeader): String =
    LinkTo(baseUrl)(requestHeader)

  def hrefWithRel(implicit requestHeader: RequestHeader): String =
    processUrl(baseUrl, Edition(requestHeader)) match {
      case ProcessedUrl(url, true) => s"""href="$url" rel="nofollow""""
      case ProcessedUrl(url, false) => s"""href="$url""""
    }
}

object Sublink {
  def fromFaciaContent(faciaContent: PressedContent): Sublink = {
    val storyContent: Option[PressedStory] = faciaContent.properties.maybeContent
    val contentType: DotcomContentType = DotcomContentType(storyContent)

    Sublink(
      faciaContent.header.kicker,
      faciaContent.header.headline,
      EditionalisedLink.fromFaciaContent(faciaContent),
      faciaContent.card.cardStyle,
      faciaContent.card.mediaType,
      Pillar(storyContent).map(_.name).getOrElse("").toLowerCase,
      contentType.name.toLowerCase()
    )
  }
}

case class Sublink(
  kicker: Option[ItemKicker],
  headline: String,
  url: EditionalisedLink,
  cardStyle: CardStyle,
  mediaType: Option[MediaType],
  pillarName: String,
  contentType: String
)

object DiscussionSettings {
  def fromTrail(faciaContent: PressedContent): DiscussionSettings = DiscussionSettings(
    faciaContent.discussion.isCommentable,
    faciaContent.discussion.isClosedForComments,
    faciaContent.discussion.discussionId
  )
}

case class DiscussionSettings(
  isCommentable: Boolean,
  isClosedForComments: Boolean,
  discussionId: Option[String]
)

case class Byline(
  get: String,
  contributorTags: Seq[model.Tag]
) {
  private def primaryContributor = {
    if (contributorTags.length > 2) {
      contributorTags.sortBy({ tag =>
        get.indexOf(tag.metadata.webTitle) match {
          case -1 => Int.MaxValue
          case n => n
        }
      }).headOption
    } else {
      None
    }
  }

  def shortByline: String = primaryContributor map { tag => s"${tag.metadata.webTitle} and others" } getOrElse get
}

object DisplaySettings {
  def fromTrail(faciaContent: PressedContent): DisplaySettings = DisplaySettings(
    faciaContent.display.isBoosted,
    faciaContent.display.showBoostedHeadline,
    faciaContent.display.showQuotedHeadline,
    faciaContent.display.imageHide,
    faciaContent.display.showLivePlayable
  )
}

case class DisplaySettings(
  /** TODO check if this should actually be used to determine anything at an item level; if not, remove it */
  isBoosted: Boolean,
  showBoostedHeadline: Boolean,
  showQuotedHeadline: Boolean,
  imageHide: Boolean,
  showLivePlayable: Boolean
)

sealed trait SnapType

case object FrontendLatestSnap extends SnapType
case object FrontendLinkSnap extends SnapType
case object FrontendOtherSnap extends SnapType

object SnapStuff {
  def fromTrail(faciaContent: PressedContent): Option[SnapStuff] = {
    val snapData = SnapData(faciaContent)

    // This val may exist if the facia press has pre-fetched the embed html. Currently only for CuratedContent or LinkSnap.
    val embedHtml = faciaContent match {
      case curated: CuratedContent => curated.enriched.flatMap(_.embedHtml)
      case link: LinkSnap => link.enriched.flatMap(_.embedHtml)
      case _ => None
    }
    faciaContent.properties.embedType match {
      case Some("latest") => Some(SnapStuff(snapData, faciaContent.properties.embedCss, FrontendLatestSnap, embedHtml))
      case Some("link") => Some(SnapStuff(snapData, faciaContent.properties.embedCss, FrontendLinkSnap, embedHtml))
      case Some(_) => Some(SnapStuff(snapData, faciaContent.properties.embedCss, FrontendOtherSnap, embedHtml))
      case None => None}}
}

case class SnapStuff(
  dataAttributes: String,
  snapCss: Option[String],
  snapType: SnapType,
  embedHtml: Option[String]
) {
  def cssClasses: Seq[String] = Seq(
    Some("js-snap"),
    Some("facia-snap"),
    snapCss.map(t => s"facia-snap--$t").orElse(Some("facia-snap--default")),
    embedHtml.map(_ => "facia-snap-embed")
  ).flatten
}

object FaciaCardHeader {
  def fromTrail(faciaContent: PressedContent, config: Option[CollectionConfig]): FaciaCardHeader = fromTrailAndKicker(
    faciaContent,
    faciaContent.header.kicker,
    config
  )

  def fromTrailAndKicker(faciaContent: PressedContent, itemKicker: Option[ItemKicker], config: Option[CollectionConfig]): FaciaCardHeader = FaciaCardHeader(
    faciaContent.display.showQuotedHeadline,
    faciaContent.card.cardStyle == ExternalLink,
    faciaContent.header.isVideo,
    faciaContent.header.isGallery,
    faciaContent.header.isAudio,
    itemKicker,
    faciaContent.header.headline,
    EditionalisedLink.fromFaciaContent(faciaContent)
  )
}

case class FaciaCardHeader(
  quoted: Boolean,
  isExternal: Boolean,
  isVideo: Boolean,
  isGallery: Boolean,
  isAudio: Boolean,
  kicker: Option[ItemKicker],
  headline: String,
  url: EditionalisedLink
)

sealed trait FaciaCardTimestamp {
  def javaScriptUpdate: Boolean

  def formatString: String
}

// By default a date string, but uses JavaScript to update to a human readable string like '22h' meaning 22 hours ago
case object DateOrTimeAgo extends FaciaCardTimestamp {
  override val javaScriptUpdate: Boolean = true
  override val formatString: String = "d MMM y"
}

case object DateTimestamp extends FaciaCardTimestamp {
  override val javaScriptUpdate: Boolean = false
  override val formatString: String = "d MMM y"
}

case object TimeTimestamp extends FaciaCardTimestamp {
  override val javaScriptUpdate: Boolean = false
  override val formatString: String = "h:mm aa"
}

object FaciaCard {
  private def getByline(faciaContent: PressedContent) = faciaContent.properties.byline.filter(const(faciaContent.properties.showByline)) map { byline =>
    Byline(byline, faciaContent.contributors)
  }

  def fromTrail(
    faciaContent: PressedContent,
    config: CollectionConfig,
    cardTypes: ItemClasses,
    showSeriesAndBlogKickers: Boolean

  ): FaciaCard = {
      val maybeKicker = faciaContent.header.kicker orElse {
        if (showSeriesAndBlogKickers) {
          faciaContent.header.seriesOrBlogKicker
        } else {
          None
        }
      }

      /** If the kicker contains the byline, don't display it */
      val suppressByline = (
                             for {
                               kicker <- maybeKicker
                               kickerText <- kicker.properties.kickerText
                               byline <- faciaContent.properties.byline
                             } yield kickerText contains byline
                             ) getOrElse false

        ContentCard(
        faciaContent.properties.maybeContentId.orElse(Option(faciaContent.card.id)),
        FaciaCardHeader.fromTrailAndKicker(faciaContent, maybeKicker, Some(config)),
        getByline(faciaContent).filterNot(Function.const(suppressByline)),
        FaciaDisplayElement.fromFaciaContentAndCardType(faciaContent, cardTypes),
        CutOut.fromTrail(faciaContent),
        faciaContent.card.cardStyle,
        cardTypes,
        Sublinks.takeSublinks(faciaContent.supporting, cardTypes).map(Sublink.fromFaciaContent),
        faciaContent.card.starRating,
        DiscussionSettings.fromTrail(faciaContent),
        SnapStuff.fromTrail(faciaContent),
        faciaContent.card.webPublicationDateOption.filterNot(const(faciaContent.shouldHidePublicationDate)),
        faciaContent.card.trailText,
        faciaContent.card.mediaType,
        DisplaySettings.fromTrail(faciaContent),
        faciaContent.card.isLive,
        if (config.showTimestamps) Option(DateTimestamp) else None,
        faciaContent.card.shortUrlPath,
        useShortByline = false,
        faciaContent.card.group,
        branding = faciaContent.branding(defaultEdition),
        properties = Some(faciaContent.properties)
      )
  }
}

sealed trait FaciaCard

case class ContentCard(
  id: Option[String],
  header: FaciaCardHeader,
  byline: Option[Byline],
  displayElement: Option[FaciaDisplayElement],
  cutOut: Option[CutOut],
  cardStyle: CardStyle,
  cardTypes: ItemClasses,
  sublinks: Seq[Sublink],
  starRating: Option[Int],
  discussionSettings: DiscussionSettings,
  snapStuff: Option[SnapStuff],
  webPublicationDate: Option[DateTime],
  trailText: Option[String],
  mediaType: Option[MediaType],
  displaySettings: DisplaySettings,
  isLive: Boolean,
  timeStampDisplay: Option[FaciaCardTimestamp],
  shortUrl: Option[String],
  useShortByline: Boolean,
  group: String,
  branding: Option[Branding],
  properties: Option[PressedProperties]
) extends FaciaCard {

  private lazy val storyContent: Option[PressedStory] = properties.flatMap(_.maybeContent)

  def paidImage: Option[ImageMedia] = {
    lazy val videoImageMedia = storyContent.flatMap(_.elements.mainVideo.map(_.images))
    lazy val imageOverride: Option[ImageMedia] = properties.flatMap(_.image flatMap ImageOverride.createImageMedia)
    lazy val defaultTrailPicture = storyContent.flatMap(_.trail.trailPicture)
    imageOverride.orElse(videoImageMedia).orElse(defaultTrailPicture)
  }

  def paidIcon: Option[String] = {
    if (header.isVideo) Some("video-icon")
    else if (header.isGallery) Some("camera")
    else if (header.isAudio) Some("volume-high")
    else None
  }

  def bylineText: Option[String] = if (useShortByline) byline.map(_.shortByline) else byline.map(_.get)

  def setKicker(kicker: Option[ItemKicker]): ContentCard = copy(header = header.copy(kicker = kicker))

  def isVideo: Boolean = displayElement match {
    case Some(InlineVideo(_, _, _, _)) => true
    case _ => false
  }

  def hasImage: Boolean = displayElement match {
    case Some(InlineVideo(_, _, _, Some(_))) => true
    case Some(InlineYouTubeMediaAtom(_, _)) => true
    case Some(InlineImage(_)) => true
    case Some(InlineSlideshow(_)) => true
    case Some(CrosswordSvg(_)) => true
    case _ => false
  }

  def withTimeStamp: ContentCard = copy(timeStampDisplay = Some(DateOrTimeAgo))

  def showDisplayElement: Boolean =
    cardTypes.allTypes.exists(_.canShowMedia) && !displaySettings.imageHide && cutOut.isEmpty

  def showStandfirst: Boolean = cardTypes.allTypes.exists(_.showStandfirst)

  def mediaWidthsByBreakpoint: WidthsByBreakpoint = FaciaWidths.mediaFromItemClasses(cardTypes)

  def showTimestamp: Boolean = timeStampDisplay.isDefined && webPublicationDate.isDefined

  val analyticsPrefix = s"${cardStyle.toneString} | group-$group${if(displaySettings.isBoosted) "+" else ""}"

  val hasInlineSnapHtml = snapStuff.exists(_.embedHtml.isDefined)

  val isMediaLink = mediaType.nonEmpty

  val hasVideoMainMedia = displayElement match {
    case Some(_: InlineVideo) if !isMediaLink => true
    case Some(_: InlineYouTubeMediaAtom) if !isMediaLink => true
    case _ => false
  }

  val designType: Option[DesignType] = storyContent.map(_.metadata.designType)
  val pillar: Option[Pillar] = Pillar(storyContent)
  val contentType: DotcomContentType = DotcomContentType(storyContent)
}
object ContentCard {

  def fromApiContent(apiContent: contentapi.Content): Option[ContentCard] = {

    val cardTypesForRecommendations = ItemClasses(mobile = MediaList, tablet = Standard)

    PartialFunction.condOpt(FaciaCard.fromTrail(
      faciaContent = FaciaContentConvert.contentToFaciaContent(apiContent),
      config = CollectionConfig.empty,
      cardTypes = cardTypesForRecommendations,
      showSeriesAndBlogKickers = false
    )) {
      case content: ContentCard => content
    }

  }
}

case class HtmlBlob(html: Html, customCssClasses: Seq[String], cardTypes: ItemClasses) extends FaciaCard

case class PaidCard(
  icon: Option[String],
  headline: String,
  kicker: Option[String],
  description: Option[String],
  image: Option[ImageMedia],
  fallbackImageUrl: Option[String],
  targetUrl: String,
  cardTypes: Option[ItemClasses] = None,
  branding: Option[Branding]
) extends FaciaCard

object PaidCard {

  def fromPressedContent(content: PressedContent, cardTypes: Option[ItemClasses] = None): PaidCard = {

    val header = content.header

    val image = {
      val properties = content.properties
      val maybeContent = properties.maybeContent
      lazy val videoImageMedia = maybeContent flatMap (_.elements.mainVideo.map(_.images))
      lazy val imageOverride = properties.image flatMap ImageOverride.createImageMedia
      lazy val defaultTrailPicture = maybeContent flatMap (_.trail.trailPicture)
      imageOverride.orElse(videoImageMedia).orElse(defaultTrailPicture)
    }

    val fallbackImageUrl = image flatMap ImgSrc.getFallbackUrl

    PaidCard(
      icon = {
        if (header.isVideo) Some("video-icon")
        else if (header.isGallery) Some("camera")
        else if (header.isAudio) Some("volume-high")
        else None
      },
      headline = header.headline,
      kicker = content.header.kicker flatMap (_.properties.kickerText),
      description = content.card.trailText,
      image,
      fallbackImageUrl,
      targetUrl = content match {
        case snap: LinkSnap => snap.properties.href getOrElse ""
        case _ => header.url
      },
      cardTypes = cardTypes,
      branding = content.branding(defaultEdition)
    )
  }
}
