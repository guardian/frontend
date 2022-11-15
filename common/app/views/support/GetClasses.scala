package views.support

import com.gu.facia.client.models.{
  BreakingPalette,
  EventAltPalette,
  EventPalette,
  InvestigationPalette,
  LongRunningAltPalette,
  LongRunningPalette,
  Metadata,
  SombreAltPalette,
  SombrePalette,
  SpecialReportAltPalette,
}
import layout._
import layout.slices._
import model.pressed.{Audio, Gallery, SpecialReport, Video}
import slices.{Dynamic, DynamicSlowMPU}
import play.api.mvc.RequestHeader
import model.Pillar.RichPillar
import model.ContentDesignType.RichContentDesignType
import model.Pillar.RichPillar
import model.pressed.{Audio, Gallery, SpecialReport, Video}
import play.api.mvc.RequestHeader
import views.support.Commercial.isAdFree

object GetClasses {

  def forHtmlBlob(item: HtmlBlob): String = {
    RenderClasses(
      Seq(
        "fc-item",
        "js-fc-item",
        item.cardTypes.classes,
      ) ++ item.customCssClasses: _*,
    )
  }

  def forItem(item: ContentCard, isFirstContainer: Boolean, isDynamic: Boolean = false)(implicit
      request: RequestHeader,
  ): String = {

    RenderClasses(
      Map(
        ("fc-item", true),
        ("js-fc-item", true),
        ("fc-item--pillar-" + item.pillar.nameOrDefault, true),
        ("fc-item--type-" + item.designType.nameOrDefault, true),
        ("fc-item--pillar-special-report", item.cardStyle == SpecialReport),
        ("fc-item--paid-content", item.branding.exists(_.isPaid)),
        ("fc-item--has-cutout", item.cutOut.isDefined),
        ("fc-item--has-no-image", !item.hasImage),
        ("fc-item--has-image", item.hasImage),
        ("fc-item--force-image-upgrade", isFirstContainer),
        (s"fc-item--has-sublinks-${item.sublinks.length}", item.sublinks.nonEmpty),
        ("fc-item--is-boosted", item.displaySettings.isBoosted),
        ("fc-item--has-boosted-title", item.displaySettings.showBoostedHeadline),
        ("fc-item--live", item.isLive),
        ("fc-item--live-updates", item.isLive && item.displaySettings.showLivePlayable),
        ("fc-item--has-metadata", item.timeStampDisplay.isDefined || item.discussionSettings.isCommentable),
        ("fc-item--has-timestamp", item.timeStampDisplay.isDefined),
        ("fc-item--is-commentable", item.discussionSettings.isCommentable),
        ("fc-item--is-media-link", item.isMediaLink),
        ("fc-item--has-video-main-media", item.hasVideoMainMedia),
        ("fc-item--is-dynamic-card", isDynamic && item.cardTypes.canBeDynamicLayout && item.cutOut.isEmpty),
        ("fc-item--has-floating-sublinks", item.hasFloatingSublinks(isDynamic)),
      ) ++ item.snapStuff.map(_.cssClasses.map(_ -> true).toMap).getOrElse(Map.empty)
        ++ mediaTypeClass(item).map(_ -> true)
        ++ adFeatureMediaClass(item).map(_ -> true),
    )
  }

  def forSubLink(sublink: Sublink)(implicit request: RequestHeader): String =
    RenderClasses(
      Map(
        ("fc-sublink", true),
        (sublinkMediaTypeClass(sublink).getOrElse(""), true),
        ("fc-sublink--pillar-" + sublink.pillar.nameOrDefault, true),
        ("fc-sublink--type-" + sublink.designType.nameOrDefault, true),
      ),
    )

  def mediaTypeClass(faciaCard: ContentCard): Option[String] =
    faciaCard.mediaType map {
      case Gallery => "fc-item--gallery"
      case Video   => "fc-item--video"
      case Audio   => "fc-item--audio"
    }

  def adFeatureMediaClass(faciaCard: ContentCard): Option[String] = {
    if (faciaCard.isAdvertisementFeature && faciaCard.isMediaLink) Some("fc-item--type-media") else None
  }

  def sublinkMediaTypeClass(sublink: Sublink): Option[String] =
    sublink.mediaType map {
      case Gallery => "fc-sublink--gallery"
      case Video   => "fc-sublink--video"
      case Audio   => "fc-sublink--audio"
    }

  def forContainerDefinition(containerDefinition: FaciaContainer)(implicit request: RequestHeader): String =
    forContainer(
      containerDefinition.showLatestUpdate,
      containerDefinition.index == 0 && containerDefinition.customHeader.isEmpty,
      containerDefinition.displayName.isDefined,
      containerDefinition.displayName.contains("headlines"),
      containerDefinition.container.toString == "Video",
      containerDefinition.commercialOptions,
      containerDefinition.hasDesktopShowMore,
      Some(containerDefinition.container),
      extraClasses = containerDefinition.customClasses.getOrElse(Seq.empty) ++
        slices.Container.customClasses(containerDefinition.container),
      disableHide = containerDefinition.hideToggle,
      lazyLoad = containerDefinition.shouldLazyLoad,
      dynamicSlowMpu =
        containerDefinition.container == Dynamic(DynamicSlowMPU(omitMPU = false, adFree = isAdFree(request))),
    )

  /** TODO get rid of this when we consolidate 'all' logic with index logic */
  def forTagContainer(hasTitle: Boolean, adFree: Boolean = false): String =
    forContainer(
      showLatestUpdate = false,
      isFirst = true,
      hasTitle,
      isHeadlines = false,
      isVideo = false,
      commercialOptions = ContainerCommercialOptions(omitMPU = false, adFree = adFree),
      hasDesktopShowMore = false,
      container = None,
      extraClasses = Nil,
      disableHide = true,
      lazyLoad = false,
      dynamicSlowMpu = false,
    )

  def forContainer(
      showLatestUpdate: Boolean,
      isFirst: Boolean,
      hasTitle: Boolean,
      isHeadlines: Boolean,
      isVideo: Boolean,
      commercialOptions: ContainerCommercialOptions,
      hasDesktopShowMore: Boolean,
      container: Option[slices.Container] = None,
      extraClasses: Seq[String] = Nil,
      disableHide: Boolean = false,
      lazyLoad: Boolean,
      dynamicSlowMpu: Boolean,
  ): String = {
    // no toggle for Headlines container as it will be hosting the weather widget instead
    val showToggle =
      !disableHide && !container.exists(!slices.Container.showToggle(_)) && !isFirst && hasTitle && !isHeadlines

    RenderClasses(
      (Seq(
        ("fc-container", true),
        ("fc-container--first", isFirst),
        ("fc-container--has-show-more", hasDesktopShowMore),
        ("js-container--first", isFirst),
        ("fc-container--video", isVideo),
        ("fc-container--lazy-load", lazyLoad),
        ("js-container--lazy-load", lazyLoad),
        ("fc-container--dynamic-slow-mpu", dynamicSlowMpu),
        ("fc-container--will-have-toggle", showToggle),
        ("js-container--toggle", showToggle),
      ) collect {
        case (kls, true) => kls
      }) ++ extraClasses: _*,
    )
  }

  def forFrontId(frontId: Option[String]): String =
    RenderClasses(
      Seq(
        "fc-container--video-no-fill-sides" -> frontId.contains("video"),
      ) collect { case (kls, true) => kls }: _*,
    )

  def paletteClasses(container: Container, metadata: Seq[Metadata]): Option[Seq[String]] = {
    container match {
      case Fixed(_) | Dynamic(_) =>
        primaryPaletteClass(metadata).map(Seq(_, "fc-container--has-palette"))
      case _ => None
    }
  }

  private val paletteClassesByMetadataTag: Map[Metadata, String] = Map(
    LongRunningPalette -> "fc-container--long-running-palette",
    LongRunningAltPalette -> "fc-container--long-running-alt-palette",
    SombrePalette -> "fc-container--sombre-palette",
    SombreAltPalette -> "fc-container--sombre-alt-palette",
    InvestigationPalette -> "fc-container--investigation-palette",
    BreakingPalette -> "fc-container--breaking-palette",
    EventPalette -> "fc-container--event-palette",
    EventAltPalette -> "fc-container--event-alt-palette",
    SpecialReportAltPalette -> "fc-container--special-report-alt-palette",
  )

  private def primaryPaletteTag(metadata: Seq[Metadata]): Option[Metadata] = {
    val paletteMetadataTags = paletteClassesByMetadataTag.keySet
    metadata.find(tag => paletteMetadataTags.contains(tag))
  }

  private def primaryPaletteClass(metadata: Seq[Metadata]): Option[String] = {
    primaryPaletteTag(metadata).map(tag => paletteClassesByMetadataTag(tag))
  }
}
