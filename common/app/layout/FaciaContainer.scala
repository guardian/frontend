package layout

import com.gu.facia.client.models.TargetedTerritory
import conf.switches.Switches
import model.pressed.{CollectionConfig, PressedContent}
import org.joda.time.DateTime
import services.CollectionConfigWithId
import slices.{MostPopular, _}
import views.support.GetClasses.paletteClasses

case class FaciaContainer(
    index: Int,
    dataId: String,
    displayName: Option[String],
    href: Option[String],
    componentId: Option[String],
    container: Container,
    collectionEssentials: CollectionEssentials,
    containerLayout: Option[ContainerLayout],
    showDateHeader: Boolean,
    showLatestUpdate: Boolean,
    commercialOptions: ContainerCommercialOptions,
    customHeader: Option[FaciaContainerHeader],
    customClasses: Option[Seq[String]],
    hideToggle: Boolean,
    showTimestamps: Boolean,
    dateLinkPath: Option[String],
    useShowMore: Boolean,
    hasShowMoreEnabled: Boolean,
    isThrasher: Boolean,
    targetedTerritory: Option[TargetedTerritory],
) {
  def transformCards(f: ContentCard => ContentCard): FaciaContainer =
    copy(
      containerLayout = containerLayout.map(_.transformCards(f)),
    )

  def faciaComponentName: String =
    componentId getOrElse {
      displayName map { title: String =>
        title.toLowerCase.replace(" ", "-")
      } getOrElse "no-name"
    }

  def latestUpdate: Option[DateTime] =
    (collectionEssentials.items.flatMap(_.card.webPublicationDateOption) ++
      collectionEssentials.lastUpdated.map(DateTime.parse)).sortBy(-_.getMillis).headOption

  def items: Seq[PressedContent] = collectionEssentials.items

  def withTimeStamps: FaciaContainer = transformCards(_.withTimeStamp)

  def territoryName: Option[String] =
    targetedTerritory.flatMap(_.id match {
      case "AU-VIC" => Some("Victoria")
      case "AU-QLD" => Some("Queensland")
      case "AU-NSW" => Some("New South Wales")
      case _        => None
    })

  def dateLink: Option[String] = {
    val maybeDateHeadline = customHeader flatMap {
      case MetaDataHeader(_, _, _, dateHeadline, _) => Some(dateHeadline)
      case LoneDateHeadline(dateHeadline)           => Some(dateHeadline)
      case DescriptionMetaHeader(_)                 => None
    }

    for {
      path <- dateLinkPath
      dateHeadline <- maybeDateHeadline
      urlFragment <- dateHeadline.urlFragment
    } yield s"$path/$urlFragment/all"
  }

  def hasShowMore: Boolean = containerLayout.exists(_.hasShowMore)

  def hasDesktopShowMore: Boolean = containerLayout.exists(_.hasDesktopShowMore)

  def hasMobileOnlyShowMore: Boolean =
    containerLayout.exists(layout => layout.hasMobileShowMore && !layout.hasDesktopShowMore)

  /** Nasty hardcoded thing.
    *
    * TODO: change Facia Tool to have a dropdown for 'header types', one of which is default, the other CP Scott.
    *
    * Then if we end up adding more of these over time, there's an in-built mechanism for doing so. Will also mean apps
    * can consume this data if they want to.
    */
  def showCPScottHeader: Boolean =
    Set(
      "uk/commentisfree/regular-stories",
      "au/commentisfree/regular-stories",
    ).contains(dataId)

  def addShowMoreClasses(): Boolean = useShowMore && containerLayout.exists(_.hasShowMore)

  def shouldLazyLoad: Boolean = Switches.LazyLoadContainersSwitch.isSwitchedOn && index > 8

  def isStoryPackage: Boolean =
    container match {
      case Dynamic(DynamicPackage) => true
      case _                       => false
    }
}

object FaciaContainer {

  def fromConfigWithId(
      index: Int,
      container: Container,
      config: CollectionConfigWithId,
      collectionEssentials: CollectionEssentials,
      hasMore: Boolean,
      componentId: Option[String] = None,
  ): FaciaContainer = {
    fromConfigWithDefault(
      index,
      container,
      ContainerDisplayConfig.withDefaults(config),
      collectionEssentials,
      componentId,
      hasMore,
    )
  }

  def fromConfigWithDefault(
      index: Int,
      container: Container,
      config: ContainerDisplayConfig,
      collectionEssentials: CollectionEssentials,
      componentId: Option[String],
      hasMore: Boolean,
  ): FaciaContainer =
    fromConfigAndAdSpecs(
      index,
      container,
      config.collectionConfigWithId,
      collectionEssentials,
      ContainerLayout
        .fromContainer(
          container,
          ContainerLayoutContext.empty,
          config,
          collectionEssentials.items,
          hasMore,
        )
        .map(_._1),
      componentId,
    )

  def fromConfigAndAdSpecs(
      index: Int,
      container: Container,
      config: CollectionConfigWithId,
      collectionEssentials: CollectionEssentials,
      containerLayout: Option[ContainerLayout],
      componentId: Option[String],
      omitMPU: Boolean = false,
      adFree: Boolean = false,
      targetedTerritory: Option[TargetedTerritory] = None,
  ): FaciaContainer =
    FaciaContainer(
      index,
      config.id,
      config.config.displayName orElse collectionEssentials.displayName,
      config.config.href orElse collectionEssentials.href,
      componentId,
      container,
      collectionEssentials,
      containerLayout,
      config.config.showDateHeader,
      config.config.showLatestUpdate,
      // popular containers should never be sponsored
      container match {
        case MostPopular  => ContainerCommercialOptions(omitMPU = omitMPU, adFree = adFree)
        case _ if !adFree => ContainerCommercialOptions(omitMPU = false, adFree = false)
        case _            => ContainerCommercialOptions(omitMPU = false, adFree = adFree)
      },
      config.config.description.map(DescriptionMetaHeader),
      customClasses = config.config.metadata.flatMap(paletteClasses(container, _)),
      hideToggle = false,
      showTimestamps = false,
      None,
      useShowMore = true,
      hasShowMoreEnabled = !config.config.hideShowMore,
      isThrasher = config.config.collectionType == "fixed/thrasher",
      targetedTerritory = targetedTerritory,
    )

  def forStoryPackage(
      dataId: String,
      items: Seq[PressedContent],
      title: String,
      href: Option[String] = None,
  ): FaciaContainer = {
    FaciaContainer
      .fromConfigWithDefault(
        index = 2,
        container = Fixed(ContainerDefinition.fastForNumberOfItems(items.size)),
        config = ContainerDisplayConfig.withDefaults(CollectionConfigWithId(dataId, CollectionConfig.empty)),
        collectionEssentials = CollectionEssentials(items take 8, Nil, Some(title), href, None, None),
        hasMore = false,
        componentId = None,
      )
      .withTimeStamps
  }
}
