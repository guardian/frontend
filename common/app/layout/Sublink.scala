package layout

import com.gu.facia.api.models._
import com.gu.facia.api.utils.{ExternalLink, MediaType, CardStyle, ItemKicker}
import common.{Edition, LinkTo}
import implicits.FaciaContentImplicits._
import implicits.FaciaContentFrontendHelpers._
import model._
import org.joda.time.DateTime
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.support._

import scala.Function.const

object EditionalisedLink {
  def fromFaciaContent(faciaContent: FaciaContent) =
    EditionalisedLink(SupportedUrl.fromFaciaContent(faciaContent))
}

case class EditionalisedLink(
  baseUrl: String
) {
  import LinkTo._

  def get(implicit requestHeader: RequestHeader): String =
    LinkTo(baseUrl)(requestHeader)

  def hrefWithRel(implicit requestHeader: RequestHeader): String =
    processUrl(baseUrl, Edition(requestHeader)) match {
      case ProcessedUrl(url, true) => s"""href="$url" rel="nofollow""""
      case ProcessedUrl(url, false) => s"""href="$url""""
    }
}

object Sublink {
  def fromFaciaContent(faciaContent: FaciaContent) =
    Sublink(
      faciaContent.itemKicker,
      faciaContent.headline,
      EditionalisedLink.fromFaciaContent(faciaContent),
      faciaContent.cardStyle,
      MediaType.fromFaciaContent(faciaContent)
    )
}

case class Sublink(
  kicker: Option[ItemKicker],
  headline: String,
  url: EditionalisedLink,
  cardStyle: CardStyle,
  mediaType: Option[MediaType]
)

object DiscussionSettings {
  def fromTrail(faciaContent: FaciaContent) = DiscussionSettings(
    faciaContent.isCommentable,
    faciaContent.isClosedForComments,
    faciaContent.discussionId
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
        get.indexOf(tag.webTitle) match {
          case -1 => Int.MaxValue
          case n => n
        }
      }).headOption
    } else {
      None
    }
  }

  def shortByline = primaryContributor map { tag => s"${tag.webTitle} and others" } getOrElse get
}

object DisplaySettings {
  def fromTrail(faciaContent: FaciaContent) = DisplaySettings(
    faciaContent.isBoosted,
    faciaContent.showBoostedHeadline,
    faciaContent.showQuotedHeadline,
    faciaContent.imageHide,
    faciaContent.showLivePlayable
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
  def fromTrail(faciaContent: FaciaContent): Option[SnapStuff] = {
    lazy val snapData = SnapData(faciaContent)
    faciaContent.embedType match {
      case Some("latest") => Option(SnapStuff(snapData, faciaContent.embedCss, FrontendLatestSnap))
      case Some("link") => Option(SnapStuff(snapData, faciaContent.embedCss, FrontendLinkSnap))
      case Some(s) => Option(SnapStuff(snapData, faciaContent.embedCss, FrontendOtherSnap))
      case None => None}}
}

case class SnapStuff(
  dataAttributes: String,
  snapCss: Option[String],
  snapType: SnapType
) {
  def cssClasses = Seq(
    "js-snap",
    "facia-snap",
    snapCss.map(t => s"facia-snap--$t").getOrElse("facia-snap--default")
  )
}

object FaciaCardHeader {
  def fromTrail(faciaContent: FaciaContent, config: Option[CollectionConfig]) = fromTrailAndKicker(
    faciaContent,
    faciaContent.itemKicker,
    config
  )

  def fromTrailAndKicker(faciaContent: FaciaContent, itemKicker: Option[ItemKicker], config: Option[CollectionConfig]) = FaciaCardHeader(
    faciaContent.showQuotedHeadline,
    faciaContent.cardStyle == ExternalLink,
    faciaContent.isVideo,
    faciaContent.isGallery,
    faciaContent.isAudio,
    itemKicker,
    faciaContent.headline,
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
  val javaScriptUpdate: Boolean

  val formatString: String
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
  private def getByline(faciaContent: FaciaContent) = faciaContent.byline.filter(const(faciaContent.showByline)) map { byline =>
    Byline(byline, faciaContent.contributors.map(Tag.apply(_)))
  }

  def fromTrail(faciaContent: FaciaContent, config: CollectionConfig, cardTypes: ItemClasses, showSeriesAndBlogKickers: Boolean) = {
    val maybeKicker = faciaContent.itemKicker orElse {
      if (showSeriesAndBlogKickers) {
        faciaContent.maybeContent.flatMap(com.gu.facia.api.utils.ItemKicker.seriesOrBlogKicker)
      } else {
        None
      }
    }

    /** If the kicker contains the byline, don't display it */
    val suppressByline = (for {
      kicker <- maybeKicker
      kickerText <- ItemKicker.kickerText(kicker)
      byline <- faciaContent.byline
    } yield kickerText contains byline) getOrElse false

    ContentCard(
      faciaContent.maybeContentId.orElse(Option(faciaContent.id)),
      FaciaCardHeader.fromTrailAndKicker(faciaContent, maybeKicker, Some(config)),
      getByline(faciaContent).filterNot(Function.const(suppressByline)),
      FaciaDisplayElement.fromFaciaContentAndCardType(faciaContent, cardTypes),
      CutOut.fromTrail(faciaContent),
      faciaContent.cardStyle,
      cardTypes,
      Sublinks.takeSublinks(faciaContent.supporting, cardTypes).map(Sublink.fromFaciaContent),
      faciaContent.starRating,
      DiscussionSettings.fromTrail(faciaContent),
      SnapStuff.fromTrail(faciaContent),
      faciaContent.webPublicationDateOption.filterNot(const(faciaContent.shouldHidePublicationDate)),
      faciaContent.trailText,
      MediaType.fromFaciaContent(faciaContent),
      DisplaySettings.fromTrail(faciaContent),
      faciaContent.isLive,
      if (config.showTimestamps) Option(DateTimestamp) else None,
      faciaContent.shortUrlPath,
      useShortByline = false,
      faciaContent.group
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
  group: String
) extends FaciaCard {
  def bylineText: Option[String] = if (useShortByline) byline.map(_.shortByline) else byline.map(_.get)

  def setKicker(kicker: Option[ItemKicker]) = copy(header = header.copy(kicker = kicker))

  def isVideo = displayElement match {
    case Some(InlineVideo(_, _, _, _)) => true
    case _ => false
  }

  def hasImage = displayElement match {
    case Some(InlineVideo(_, _, _, Some(_))) => true
    case Some(InlineImage(_)) => true
    case Some(InlineSlideshow(_)) => true
    case Some(CrosswordSvg(_)) => true
    case _ => false
  }

  def withTimeStamp = copy(timeStampDisplay = Some(DateOrTimeAgo))

  def showDisplayElement =
    cardTypes.allTypes.exists(_.canShowMedia) && !displaySettings.imageHide && !cutOut.isDefined

  def showStandfirst = cardTypes.allTypes.exists(_.showStandfirst)

  def mediaWidthsByBreakpoint = FaciaWidths.mediaFromItemClasses(cardTypes)

  def showTimestamp = timeStampDisplay.isDefined && webPublicationDate.isDefined

  def isSavedForLater = cardTypes.allTypes.exists(_.savedForLater)

  val analyticsPrefix = s"${cardStyle.toneString} | group-$group${if(displaySettings.isBoosted) "+" else ""}"
}

case class HtmlBlob(html: Html, customCssClasses: Seq[String], cardTypes: ItemClasses) extends FaciaCard
