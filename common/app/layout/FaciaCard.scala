package layout

import cards.{MediaList, Standard}
import com.gu.commercial.branding.Branding
import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentapi.client.utils.{AdvertisementFeature, DesignType}
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

sealed trait FaciaCard

object FaciaCard {
  private def getByline(faciaContent: PressedContent) =
    faciaContent.properties.byline.filter(const(faciaContent.properties.showByline)) map { byline =>
      Byline(byline, faciaContent.contributors)
    }

  def fromTrail(
      faciaContent: PressedContent,
      config: CollectionConfig,
      cardTypes: ItemClasses,
      showSeriesAndBlogKickers: Boolean,
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
      properties = Some(faciaContent.properties),
    )
  }
}

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
    properties: Option[PressedProperties],
    fromShowMore: Boolean = false,
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

  def mediaTypeIcon: Option[String] = {
    if (header.isGallery) Some("gallery")
    else if (header.isAudio) Some("podcast")
    else if (header.isVideo) Some("video")
    else None
  }

  def bylineText: Option[String] = if (useShortByline) byline.map(_.shortByline) else byline.map(_.get)

  def setKicker(kicker: Option[ItemKicker]): ContentCard = copy(header = header.copy(kicker = kicker))

  def isVideo: Boolean =
    displayElement match {
      case Some(InlineVideo(_, _, _)) => true
      case _                          => false
    }

  def hasImage: Boolean =
    displayElement match {
      case Some(InlineVideo(_, _, Some(_)))   => true
      case Some(InlineYouTubeMediaAtom(_, _)) => true
      case Some(InlineImage(_))               => true
      case Some(InlineSlideshow(_))           => true
      case Some(CrosswordSvg(_))              => true
      case _                                  => false
    }

  def dataLinkName(index: Int): String = {
    val name = s"$analyticsPrefix | card-@${index + 1}"
    val withFromShowMore = if (fromShowMore) s"showmore | $name" else name
    withFromShowMore
  }

  def withTimeStamp: ContentCard = copy(timeStampDisplay = Some(DateOrTimeAgo))

  def showDisplayElement: Boolean =
    cardTypes.allTypes.exists(_.canShowMedia) && !displaySettings.imageHide && cutOut.isEmpty

  def showReviewStars: Boolean =
    starRating.isDefined && (displayElement match {
      case Some(InlineImage(_)) if showDisplayElement => false
      case _                                          => true
    })

  def showStandfirst: Boolean = cardTypes.allTypes.exists(_.showStandfirst)

  def mediaWidthsByBreakpoint(implicit requestHeader: RequestHeader): WidthsByBreakpoint =
    FaciaWidths.mediaFromItemClasses(cardTypes)

  def squareImageWidthsByBreakpoint(implicit requestHeader: RequestHeader): WidthsByBreakpoint =
    FaciaWidths.squareFront()

  def showTimestamp: Boolean = timeStampDisplay.isDefined && webPublicationDate.isDefined

  def hasFloatingSublinks(isDynamicCard: Boolean): Boolean = {
    // We're moving the logic for these classes in CSS into the Scala
    // because this generates loads and loads of pointless CSS, and it would
    // be better to just have one class to define whether sublinks floated
    // over the main media. So here we are.
    // Replaces:
    //    &.fc-item--full-media-75-tablet.fc-item--has-sublinks-3,
    //    &.fc-item--full-media-100-tablet,
    //    &.fc-item--full-media-100-tablet,
    //    &.fc-item--three-quarters-tablet.fc-item--has-sublinks-2,
    //    &.fc-item--three-quarters-tall-tablet

    val canHaveFloatingSublinks = isDynamicCard && cardTypes.canBeDynamicLayout && cutOut.isEmpty
    val sublinksLength = sublinks.length
    val types = cardTypes.allTypes

    val checks: List[Boolean] = List(
      types.contains(cards.FullMedia75) && sublinksLength == 3,
      types.contains(cards.FullMedia100),
      types.contains(cards.ThreeQuarters) && sublinksLength == 2,
      types.contains(cards.ThreeQuartersTall),
    )

    canHaveFloatingSublinks && checks.contains(true)
  }

  val analyticsPrefix = s"${cardStyle.toneString} | group-$group${if (displaySettings.isBoosted) "+" else ""}"

  val hasInlineSnapHtml = snapStuff.exists(_.embedHtml.isDefined)

  val isMediaLink = mediaType.nonEmpty

  val hasVideoMainMedia = displayElement match {
    case Some(_: InlineVideo) if !isMediaLink            => true
    case Some(_: InlineYouTubeMediaAtom) if !isMediaLink => true
    case _                                               => false
  }

  val designType: Option[DesignType] = storyContent.map(_.metadata.designType)
  val pillar: Option[Pillar] = Pillar(storyContent)
  val contentType: DotcomContentType = DotcomContentType(storyContent)

  val isAdvertisementFeature: Boolean = designType.contains(AdvertisementFeature)
}

object ContentCard {

  def fromApiContent(apiContent: contentapi.Content): Option[ContentCard] = {

    val cardTypesForRecommendations = ItemClasses(mobile = MediaList, tablet = Standard)

    PartialFunction.condOpt(
      FaciaCard.fromTrail(
        faciaContent = FaciaContentConvert.contentToFaciaContent(apiContent),
        config = CollectionConfig.empty,
        cardTypes = cardTypesForRecommendations,
        showSeriesAndBlogKickers = false,
      ),
    ) {
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
    branding: Option[Branding],
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
        case _              => header.url
      },
      cardTypes = cardTypes,
      branding = content.branding(defaultEdition),
    )
  }
}
