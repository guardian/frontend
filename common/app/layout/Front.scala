package layout

import common.{Edition, LinkTo}
import conf.switches.Switches
import model.PressedPage
import model.facia.PressedCollection
import model.meta.{ItemList, ListItem}
import model.pressed.{CollectionConfig, PressedContent}
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import services.CollectionConfigWithId
import slices.{MostPopular, _}
import views.support.CutOut

import scala.Function._
import scala.annotation.tailrec

/** For de-duplicating cutouts */
object ContainerLayoutContext {
  val empty = ContainerLayoutContext(Set.empty, hideCutOuts = false)
}

case class ContainerLayoutContext(
  cutOutsSeen: Set[CutOut],
  hideCutOuts: Boolean
) {
  def addCutOuts(cutOut: Set[CutOut]): ContainerLayoutContext = copy(cutOutsSeen = cutOutsSeen ++ cutOut)

  type CardAndContext = (ContentCard, ContainerLayoutContext)

  private def dedupCutOut(cardAndContext: CardAndContext): CardAndContext = {
    val (content, context) = cardAndContext

    val maybeSnapType: Option[SnapType] = content.snapStuff.map(_.snapType)
    if (maybeSnapType.contains(FrontendLatestSnap)) {
      (content, context)
    } else {
      val newCard = if (content.cutOut.exists(cutOutsSeen.contains)) {
        content.copy(cutOut = None)
      } else {
        content
      }
      (newCard, context.addCutOuts(content.cutOut.filter(const(content.cardTypes.showCutOut)).toSet))
    }
  }

  private val transforms = Seq(
    dedupCutOut _
  ).reduce(_ compose _)

  def transform(card: FaciaCardAndIndex): (FaciaCardAndIndex, ContainerLayoutContext) = {
    if (hideCutOuts) {
      (card.transformCard(_.copy(cutOut = None)), this)
    } else {
      // Latest snaps are sometimes used to promote journalists, and the cut out should always show on these snaps.
      card.item match {
        case content: ContentCard =>
          val (newCard, newContext) = transforms((content, this))
          (card.copy(item = newCard), newContext)

        case _ => (card, this)
      }
    }
  }
}

object CollectionEssentials {
  /* FAPI Integration */

  def fromPressedCollection(collection: PressedCollection): CollectionEssentials = CollectionEssentials(
    collection.curatedPlusBackfillDeduplicated,
    collection.treats,
    Option(collection.displayName),
    collection.href,
    collection.lastUpdated.map(_.toString),
    if (collection.curated.isEmpty) Some(9) else None
  )

  def fromFaciaContent(trails: Seq[PressedContent]): CollectionEssentials = CollectionEssentials(
    trails,
    Nil,
    None,
    None,
    None,
    None
  )

  val empty = CollectionEssentials(Nil, Nil, None, None, None, None)
}

case class CollectionEssentials(
  items: Seq[PressedContent],
  treats: Seq[PressedContent],
  displayName: Option[String],
  href: Option[String],
  lastUpdated: Option[String],
  showMoreLimit: Option[Int]
)

case class ContainerCommercialOptions(omitMPU: Boolean, adFree: Boolean)

object FaciaContainer {
  def apply(
    index: Int,
    container: Container,
    config: CollectionConfigWithId,
    collectionEssentials: CollectionEssentials,
    hasMore: Boolean,
    componentId: Option[String] = None
  ): FaciaContainer = {
    apply(
      index,
      container,
      ContainerDisplayConfig.withDefaults(config),
      collectionEssentials,
      componentId,
      hasMore
    )
  }

  def apply(
    index: Int,
    container: Container,
    config: ContainerDisplayConfig,
    collectionEssentials: CollectionEssentials,
    componentId: Option[String],
    hasMore: Boolean
  ): FaciaContainer = fromConfig(
    index,
    container,
    config.collectionConfigWithId,
    collectionEssentials,
    ContainerLayout.fromContainer(
      container,
      ContainerLayoutContext.empty,
      config,
      collectionEssentials.items,
      hasMore
    ).map(_._1),
    componentId
  )

  def fromConfig(
    index: Int,
    container: Container,
    config: CollectionConfigWithId,
    collectionEssentials: CollectionEssentials,
    containerLayout: Option[ContainerLayout],
    componentId: Option[String],
    omitMPU: Boolean = false,
    adFree: Boolean = false
  ): FaciaContainer = FaciaContainer(
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
      case MostPopular => ContainerCommercialOptions(omitMPU = omitMPU, adFree = adFree)
      case _ if !adFree => ContainerCommercialOptions(omitMPU = false, adFree = false)
      case _ => ContainerCommercialOptions(omitMPU = false, adFree = adFree)
    },
    config.config.description.map(DescriptionMetaHeader),
    None,
    hideToggle = false,
    showTimestamps = false,
    None,
    useShowMore = true,
    hasShowMoreEnabled = !config.config.hideShowMore,
    isThrasher = config.config.collectionType == "fixed/thrasher"
  )

  def forStoryPackage(dataId: String, items: Seq[PressedContent], title: String, href: Option[String] = None): FaciaContainer = {
    FaciaContainer(
      index = 2,
      container = Fixed(ContainerDefinition.fastForNumberOfItems(items.size)),
      config = ContainerDisplayConfig.withDefaults(CollectionConfigWithId(dataId, CollectionConfig.empty)),
      collectionEssentials = CollectionEssentials(items take 8, Nil, Some(title), href, None, None),
      hasMore = false,
      componentId = None
    ).withTimeStamps
  }
}

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
  isThrasher: Boolean
) {
  def transformCards(f: ContentCard => ContentCard): FaciaContainer = copy(
    containerLayout = containerLayout.map(_.transformCards(f))
  )

  def faciaComponentName: String = componentId getOrElse {
    displayName map { title: String =>
      title.toLowerCase.replace(" ", "-")
    } getOrElse "no-name"
  }

  def latestUpdate: Option[DateTime] = (collectionEssentials.items.flatMap(_.card.webPublicationDateOption) ++
    collectionEssentials.lastUpdated.map(DateTime.parse)).sortBy(-_.getMillis).headOption

  def items: Seq[PressedContent] = collectionEssentials.items

  def withTimeStamps: FaciaContainer = transformCards(_.withTimeStamp)

  def dateLink: Option[String] = {
    val maybeDateHeadline = customHeader flatMap  {
      case MetaDataHeader(_, _, _, dateHeadline, _) => Some(dateHeadline)
      case LoneDateHeadline(dateHeadline) => Some(dateHeadline)
      case DescriptionMetaHeader(_) => None
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
  def showCPScottHeader: Boolean = Set(
    "uk/commentisfree/regular-stories",
    "au/commentisfree/regular-stories"
  ).contains(dataId)

  def addShowMoreClasses(): Boolean = useShowMore && containerLayout.exists(_.hasShowMore)

  def shouldLazyLoad: Boolean = Switches.LazyLoadContainersSwitch.isSwitchedOn && index > 8

  def isStoryPackage: Boolean = container match {
    case Dynamic(DynamicPackage) => true
    case _ => false
  }
}

object Front extends implicits.Collections {
  type TrailUrl = String

  def itemsVisible(containerDefinition: ContainerDefinition): Int =
    itemsVisible(containerDefinition.slices)

  def itemsVisible(slices: Seq[Slice]): Int =
    slices.flatMap(_.layout.columns.map(_.numItems)).sum

  // Never de-duplicate snaps.
  def participatesInDeduplication(faciaContent: PressedContent): Boolean = faciaContent.properties.embedType.isEmpty

  def fromConfigsAndContainers(
    configs: Seq[((ContainerDisplayConfig, CollectionEssentials), Container)],
    initialContext: ContainerLayoutContext = ContainerLayoutContext.empty
  ): Front = {

    @tailrec
    def faciaContainers(allConfigs: Seq[((ContainerDisplayConfig, CollectionEssentials), Container)],
                        context: ContainerLayoutContext,
                        index: Int = 0,
                        accumulation: Vector[FaciaContainer] = Vector.empty): Seq[FaciaContainer] = {
      allConfigs.toList match {
        case Nil => accumulation
        case ((config, collection), container) :: remainingConfigs =>
          val newItems = collection.items.distinctBy(_.header.url)
          val layoutMaybe = ContainerLayout.fromContainer(container, context, config, newItems, hasMore = false)
          val newContext = layoutMaybe.map(_._2).getOrElse(context)
          val faciaContainer = FaciaContainer.fromConfig(
            index,
            container,
            config.collectionConfigWithId,
            collection.copy(items = newItems),
            layoutMaybe.map(_._1),
            None
          )
          faciaContainers(remainingConfigs, newContext, index + 1, accumulation :+ faciaContainer)
      }
    }

    Front(
      faciaContainers(configs, initialContext).filterNot(_.items.isEmpty)
    )
  }

  def fromPressedPageWithDeduped(pressedPage: PressedPage,
                                 edition: Edition,
                                 initialContext: ContainerLayoutContext = ContainerLayoutContext.empty,
                                 adFree: Boolean): Seq[FaciaContainer] = {

    @tailrec
    def faciaContainers(collections: List[PressedCollection],
                        context: ContainerLayoutContext,
                        index: Int = 0,
                        accumulation: Seq[FaciaContainer] =  Vector.empty[FaciaContainer]
                       ): Seq[FaciaContainer] = {

      collections match {
        case Nil => accumulation
        case pressedCollection :: remainingPressedCollections =>
          val omitMPU: Boolean = pressedPage.metadata.omitMPUsFromContainers(edition)
          val container: Container = Container.fromPressedCollection(pressedCollection, omitMPU, adFree)
          val newItems = pressedCollection.curatedPlusBackfillDeduplicated.distinctBy(_.header.url)

          val collectionEssentials = CollectionEssentials.fromPressedCollection(pressedCollection)
          val containerDisplayConfig = ContainerDisplayConfig.withDefaults(pressedCollection.collectionConfigWithId)

          val containerLayoutMaybe: Option[(ContainerLayout, ContainerLayoutContext)] = ContainerLayout.fromContainer(container, context, containerDisplayConfig, newItems, pressedCollection.hasMore)
          val newContext: ContainerLayoutContext = containerLayoutMaybe.map(_._2).getOrElse(context)
          val faciaContainer = FaciaContainer.fromConfig(
            index,
            container,
            pressedCollection.collectionConfigWithId,
            collectionEssentials.copy(items = newItems),
            containerLayoutMaybe.map(_._1),
            None,
            omitMPU = if (containerLayoutMaybe.isDefined) false else omitMPU,
            adFree = adFree
          )

          faciaContainers(
            remainingPressedCollections,
            newContext,
            index + 1,
            accumulation :+ faciaContainer
          )
      }
    }

    faciaContainers(
      pressedPage.collections.filterNot(_.curatedPlusBackfillDeduplicated.isEmpty),
      initialContext
    )
  }

  def fromPressedPage(pressedPage: PressedPage,
                      edition: Edition,
                      initialContext: ContainerLayoutContext = ContainerLayoutContext.empty,
                      adFree: Boolean): Front =
    Front(fromPressedPageWithDeduped(pressedPage, edition, initialContext, adFree))

  def makeLinkedData(url: String, collections: Seq[FaciaContainer])(implicit request: RequestHeader): ItemList = {
    ItemList(
      LinkTo(url),
      collections.zipWithIndex.map {
        case (collection, index) =>
          ListItem(position = index, item = Some(
            ItemList(
              LinkTo(url), // don't have a uri for each container
              collection.items.zipWithIndex.map {
                case (item, i) =>
                  ListItem(position = i, url = Some(LinkTo(item.header.url)))
              }
            )
          ))
      }
    )
  }

}

case class Front(
  containers: Seq[FaciaContainer]
)
