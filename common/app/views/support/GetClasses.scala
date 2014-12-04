package views.support

import layout.{ContainerCommercialOptions, FaciaContainer, Sublink, FaciaCard}

object GetClasses {
  def forItem(item: FaciaCard, isFirstContainer: Boolean) = {
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
      ("fc-item--has-metadata", item.timeStampDisplay.isDefined || item.discussionSettings.isCommentable)
    ) ++ item.snapStuff.cssClasses.map(_ -> true) ++ mediaTypeClass(item).map(_ -> true))
  }

  def forSubLink(sublink: Sublink) = RenderClasses(Seq(
    Some("fc-sublink"),
    Some(TrailCssClasses.toneClassFromStyle(sublink.cardStyle) + "--sublink"),
    sublinkMediaTypeClass(sublink)
  ).flatten: _*)

  def mediaTypeClass(faciaCard: FaciaCard) = faciaCard.mediaType map {
    case layout.Gallery => "fc-item--gallery"
    case layout.Video => "fc-item--video"
    case layout.Audio => "fc-item--audio"
  }

  def sublinkMediaTypeClass(sublink: Sublink) = sublink.mediaType map {
    case layout.Gallery => "fc-sublink--gallery"
    case layout.Video => "fc-sublink--video"
    case layout.Audio => "fc-sublink--audio"
  }

  def forContainerDefinition(containerDefinition: FaciaContainer) =
    forContainer(
      containerDefinition.showLatestUpdate,
      containerDefinition.index == 0 && containerDefinition.customHeader.isEmpty,
      containerDefinition.displayName.isDefined,
      containerDefinition.commercialOptions,
      Some(containerDefinition.container),
      extraClasses = containerDefinition.customClasses.getOrElse(Seq.empty) ++
        slices.Container.customClasses(containerDefinition.container),
      disableHide = containerDefinition.hideToggle
    )

  /** TODO get rid of this when we consolidate 'all' logic with index logic */
  def forTagContainer(hasTitle: Boolean) = forContainer(
    showLatestUpdate = false,
    isFirst = true,
    hasTitle,
    ContainerCommercialOptions.empty,
    None,
    Nil,
    disableHide = true
  )

  def forContainer(
    showLatestUpdate: Boolean,
    isFirst: Boolean,
    hasTitle: Boolean,
    commercialOptions: ContainerCommercialOptions,
    container: Option[slices.Container] = None,
    extraClasses: Seq[String] = Nil,
    disableHide: Boolean = false
  ) = {
    RenderClasses((Seq(
      ("js-container--fetch-updates", showLatestUpdate),
      ("fc-container", true),
      ("fc-container", true),
      ("fc-container--first", isFirst),
      ("fc-container--sponsored", commercialOptions.isSponsored),
      ("fc-container--advertisement-feature", commercialOptions.isAdvertisementFeature),
      ("fc-container--foundation-supported", commercialOptions.isFoundationSupported),
      ("js-sponsored-container", commercialOptions.isPaidFor),
      ("js-container--toggle",
        !disableHide && !container.exists(!slices.Container.showToggle(_)) && !isFirst && hasTitle && !commercialOptions.isPaidFor)
    ) collect {
      case (kls, true) => kls
    }) ++ extraClasses: _*)
  }
}
