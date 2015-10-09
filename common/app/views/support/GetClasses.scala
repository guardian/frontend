package views.support

import com.gu.facia.api.utils.{Audio, Video, Gallery}
import layout._
import conf.switches.Switches.SaveForLaterSwitch
import slices.{DynamicSlowMPU, Dynamic}

object GetClasses {
  def forHtmlBlob(item: HtmlBlob) = {
    RenderClasses(Seq(
      "fc-item",
      "js-fc-item",
      item.cardTypes.classes
    ) ++ item.customCssClasses: _*)
  }

  def forItem(item: ContentCard, isFirstContainer: Boolean) = {
    RenderClasses(Map(
      ("fc-item", true),
      ("js-fc-item", true),
      ("fc-item--has-cutout", item.cutOut.isDefined),
      (TrailCssClasses.toneClassFromStyle(item.cardStyle) + "--item", true),
      ("fc-item--has-no-image", !item.hasImage),
      ("fc-item--has-image", item.hasImage),
      ("fc-item--force-image-upgrade", isFirstContainer),
      (s"fc-item--has-sublinks-${item.sublinks.length}", item.sublinks.nonEmpty),
      ("fc-item--has-boosted-title", item.displaySettings.showBoostedHeadline),
      ("fc-item--live", item.isLive),
      ("fc-item--has-metadata",
        item.timeStampDisplay.isDefined || item.discussionSettings.isCommentable || SaveForLaterSwitch.isSwitchedOn),
      ("fc-item--has-timestamp", item.timeStampDisplay.isDefined),
      ("fc-item--is-commentable", item.discussionSettings.isCommentable)
    ) ++ item.snapStuff.map(_.cssClasses.map(_ -> true).toMap).getOrElse(Map.empty)
      ++ mediaTypeClass(item).map(_ -> true)
    )
  }

  def forSubLink(sublink: Sublink) = RenderClasses(Seq(
    Some("fc-sublink"),
    Some(TrailCssClasses.toneClassFromStyle(sublink.cardStyle) + "--sublink"),
    sublinkMediaTypeClass(sublink)
  ).flatten: _*)

  def mediaTypeClass(faciaCard: ContentCard) = faciaCard.mediaType map {
    case Gallery => "fc-item--gallery"
    case Video => "fc-item--video"
    case Audio => "fc-item--audio"
  }

  def sublinkMediaTypeClass(sublink: Sublink) = sublink.mediaType map {
    case Gallery => "fc-sublink--gallery"
    case Video => "fc-sublink--video"
    case Audio => "fc-sublink--audio"
  }

  def forContainerDefinition(containerDefinition: FaciaContainer) =
    forContainer(
      containerDefinition.showLatestUpdate,
      containerDefinition.index == 0 && containerDefinition.customHeader.isEmpty,
      containerDefinition.displayName.isDefined,
      containerDefinition.displayName == Some("headlines"),
      containerDefinition.commercialOptions,
      containerDefinition.hasDesktopShowMore,
      Some(containerDefinition.container),
      extraClasses = containerDefinition.customClasses.getOrElse(Seq.empty) ++
        slices.Container.customClasses(containerDefinition.container),
      disableHide = containerDefinition.hideToggle,
      lazyLoad = containerDefinition.shouldLazyLoad,
      dynamicSlowMpu = containerDefinition.container == Dynamic(DynamicSlowMPU)
    )

  /** TODO get rid of this when we consolidate 'all' logic with index logic */
  def forTagContainer(hasTitle: Boolean) = forContainer(
    showLatestUpdate = false,
    isFirst = true,
    hasTitle,
    isHeadlines = false,
    ContainerCommercialOptions.empty,
    hasDesktopShowMore = false,
    container = None,
    extraClasses = Nil,
    disableHide = true,
    lazyLoad = false,
    dynamicSlowMpu = false
  )

  def forContainer(
    showLatestUpdate: Boolean,
    isFirst: Boolean,
    hasTitle: Boolean,
    isHeadlines: Boolean,
    commercialOptions: ContainerCommercialOptions,
    hasDesktopShowMore: Boolean,
    container: Option[slices.Container] = None,
    extraClasses: Seq[String] = Nil,
    disableHide: Boolean = false,
    lazyLoad: Boolean,
    dynamicSlowMpu: Boolean
  ) = {
    RenderClasses((Seq(
      ("fc-container", true),
      ("fc-container--first", isFirst),
      ("fc-container--has-show-more", hasDesktopShowMore),
      ("js-container--first", isFirst),
      ("fc-container--sponsored", commercialOptions.isSponsored),
      ("fc-container--advertisement-feature", commercialOptions.isAdvertisementFeature),
      ("fc-container--foundation-supported", commercialOptions.isFoundationSupported),
      ("fc-container--lazy-load", lazyLoad),
      ("js-container--lazy-load", lazyLoad),
      ("fc-container--dynamic-slow-mpu", dynamicSlowMpu),
      ("js-sponsored-container", commercialOptions.isPaidFor),
      ("js-container--toggle",
        // no toggle for Headlines container as it will be hosting the weather widget instead
        !disableHide && !container.exists(!slices.Container.showToggle(_)) && !isFirst && hasTitle && !isHeadlines && !commercialOptions.isPaidFor)
    ) collect {
      case (kls, true) => kls
    }) ++ extraClasses: _*)
  }
}
