package layout

import com.gu.facia.client.models.CollectionConfig
import common.{Edition, LinkTo}
import model._
import org.joda.time.DateTime
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.support._
import Function.const

object MediaType {
  def fromTrail(trail: Trail): Option[MediaType] = trail match {
    case _: model.Gallery => Some(Gallery)
    case _: model.Video => Some(Video)
    case _: model.Audio => Some(Audio)
    case _ => None
  }
}

sealed trait MediaType

case object Gallery extends MediaType
case object Video extends MediaType
case object Audio extends MediaType

object EditionalisedLink {
  def fromTrail(trail: Trail) = EditionalisedLink {
    trail match {
      case snap: Snap if snap.snapHref.exists(_.nonEmpty) => snap.snapHref.get
      case _ => trail.url
    }
  }
}

case class EditionalisedLink(
  baseUrl: String
) {
  import LinkTo._

  def get(implicit requestHeader: RequestHeader): String =
    LinkTo(baseUrl)(requestHeader)

  def hrefWithRel(implicit requestHeader: RequestHeader): String =
    processUrl(baseUrl, Edition(requestHeader)) match {
      case ProcessedUrl(url, true) => s"""href="${handleQueryStrings(url)}" rel="nofollow""""
      case ProcessedUrl(url, false) => s"""href="${handleQueryStrings(url)}""""
    }
}

object Sublink {
  def fromTrail(trail: Trail) =
    Sublink(
      ItemKicker.fromTrail(trail, None),
      trail.headline,
      EditionalisedLink.fromTrail(trail),
      CardStyle(trail),
      MediaType.fromTrail(trail)
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
  def fromTrail(trail: Trail) = DiscussionSettings(
    trail.isCommentable,
    trail.isClosedForComments,
    trail.discussionId
  )
}

case class DiscussionSettings(
  isCommentable: Boolean,
  isClosedForComments: Boolean,
  discussionId: Option[String]
)

case class Byline(
  get: String,
  contributorTags: Seq[Tag]
) {
  def htmlWithLinks(requestHeader: RequestHeader) =
    ContributorLinks(Html(get), contributorTags)(requestHeader)
}

object DisplaySettings {
  def fromTrail(trail: Trail) = DisplaySettings(
    trail.isBoosted,
    trail.showBoostedHeadline,
    trail.showQuotedHeadline,
    trail.imageHide
  )
}

case class DisplaySettings(
  /** TODO check if this should actually be used to determine anything at an item level; if not, remove it */
  isBoosted: Boolean,
  showBoostedHeadline: Boolean,
  showQuotedHeadline: Boolean,
  imageHide: Boolean
)

sealed trait SnapType

case object LatestSnap extends SnapType
case object OtherSnap extends SnapType

object SnapStuff {
  def fromTrail(trail: Trail) = SnapStuff(
    SnapData(trail),
    trail match {
      case c: Content => c.snapCss
      case _ => None
    },
    if (trail.snapType.exists(_ == "latest")) {
      LatestSnap
    } else {
      OtherSnap
    }
  )
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
  def fromTrail(trail: Trail, config: Option[CollectionConfig]) = FaciaCardHeader(
    trail.showQuotedHeadline,
    ItemKicker.fromTrail(trail, config),
    trail.headline,
    EditionalisedLink.fromTrail(trail)
  )
}

case class FaciaCardHeader(
  quoted: Boolean,
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
  private def getByline(content: Content) = content.byline.filter(const(content.showByline)) map { byline =>
    Byline(byline, content.contributors)
  }

  def fromTrail(trail: Trail, config: CollectionConfig, cardTypes: ItemClasses) = {
    val content = trail match {
      case c: Content => Some(c)
      case _ => None
    }

    val maybeKicker = ItemKicker.fromTrail(trail, Some(config))

    /** If the kicker contains the byline, don't display it */
    val suppressByline = (for {
      kicker <- maybeKicker
      kickerText <- ItemKicker.kickerText(kicker)
      byline <- trail.byline
    } yield kickerText contains byline) getOrElse false

    FaciaCard(
      content.map(_.id),
      trail.headline,
      FaciaCardHeader.fromTrail(trail, Some(config)),
      content.flatMap(getByline).filterNot(Function.const(suppressByline)),
      FaciaDisplayElement.fromTrail(trail),
      CutOut.fromTrail(trail),
      CardStyle(trail),
      cardTypes,
      Sublinks.takeSublinks(trail.supporting, cardTypes).map(Sublink.fromTrail),
      content.flatMap(_.starRating),
      EditionalisedLink.fromTrail(trail),
      DiscussionSettings.fromTrail(trail),
      SnapStuff.fromTrail(trail),
      Some(trail.webPublicationDate).filterNot(const(trail.shouldHidePublicationDate)),
      trail.trailText,
      MediaType.fromTrail(trail),
      DisplaySettings.fromTrail(trail),
      trail.isLive,
      None
    )
  }
}

case class FaciaCard(
  id: Option[String],
  headline: String,
  header: FaciaCardHeader,
  byline: Option[Byline],
  displayElement: Option[FaciaDisplayElement],
  cutOut: Option[CutOut],
  cardStyle: CardStyle,
  cardTypes: ItemClasses,
  sublinks: Seq[Sublink],
  starRating: Option[Int],
  url: EditionalisedLink,
  discussionSettings: DiscussionSettings,
  snapStuff: SnapStuff,
  webPublicationDate: Option[DateTime],
  trailText: Option[String],
  mediaType: Option[MediaType],
  displaySettings: DisplaySettings,
  isLive: Boolean,
  timeStampDisplay: Option[FaciaCardTimestamp]
) {
  def setKicker(kicker: Option[ItemKicker]) = copy(header = header.copy(kicker = kicker))

  def isVideo = displayElement match {
    case Some(InlineVideo(_, _, _, _)) => true
    case _ => false
  }

  def hasImage = displayElement match {
    case Some(InlineVideo(_, _, _, Some(_))) => true
    case Some(InlineImage(_)) => true
    case _ => false
  }

  def withTimeStamp = copy(timeStampDisplay = Some(DateOrTimeAgo))
}
