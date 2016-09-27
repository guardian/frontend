package layout

import common.dfp._
import common.{Edition, LinkTo}
import conf.switches.Switches
import model.facia.PressedCollection
import model.meta.{ItemList, ListItem}
import model.pressed.{CollectionConfig, PressedContent}
import model.{ContentType, PressedPage}
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import services.CollectionConfigWithId
import slices.{MostPopular, _}
import views.support.CutOut

import scala.Function._

/** For de-duplicating cutouts */
object ContainerLayoutContext {
  val empty = ContainerLayoutContext(Set.empty, hideCutOuts = false)
}

case class ContainerLayoutContext(
  cutOutsSeen: Set[CutOut],
  hideCutOuts: Boolean
) {
  def addCutOuts(cutOut: Set[CutOut]) = copy(cutOutsSeen = cutOutsSeen ++ cutOut)

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

  def transform(card: FaciaCardAndIndex) = {
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

  def fromPressedCollection(collection: PressedCollection) = CollectionEssentials(
    collection.curatedPlusBackfillDeduplicated,
    collection.treats,
    Option(collection.displayName),
    collection.href,
    collection.lastUpdated.map(_.toString),
    if (collection.curated.isEmpty) Some(9) else None
  )

  def fromFaciaContent(trails: Seq[PressedContent]) = CollectionEssentials(
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

object ContainerCommercialOptions {
  def fromConfig(config: CollectionConfig) = {
    DfpAgent.findContainerCapiTagIdAndDfpTag(config) map { tagData =>
      val capiTagId = tagData.capiTagId
      val dfpTag = tagData.dfpTag

      val sponsor = {
        def tagTypeAndIdMatch(): Boolean = {
          (dfpTag.tagType == Series && capiTagId.contains("/series/")) ||
          (dfpTag.tagType == Keyword && capiTagId.matches("(\\w+)/\\1"))
        }
        if (tagTypeAndIdMatch()) {
          dfpTag.lineItems.headOption flatMap (_.sponsor)
        } else {
          None
        }
      }

      ContainerCommercialOptions(
        isSponsored = dfpTag.paidForType == Sponsored,
        isPaidContainer = dfpTag.paidForType == AdvertisementFeature,
        isFoundationSupported = dfpTag.paidForType == FoundationFunded,
        hasPaidForContent = false,
        sponsor,
        sponsorshipTag = Some(SponsorshipTag(dfpTag.tagType, capiTagId)),
        sponsorshipType = Some(dfpTag.paidForType.name),
        omitMPU = false
      )
    } getOrElse empty
  }

  def fromCollection(collection: CollectionEssentials): ContainerCommercialOptions = {

    def mkFromFirstItemInCollection(item: PressedContent): Option[ContainerCommercialOptions] = {

      def sponsoredTagPair(content: ContentType): Option[CapiTagAndDfpTag] = {
        DfpAgent.winningTagPair(
          capiTags = content.tags.tags,
          sectionId = Some(content.metadata.sectionId),
          edition = None
        )
      }

      def mkFromSponsoredTagPair(tagProps: CapiTagAndDfpTag): ContainerCommercialOptions = {
        val capiTag = tagProps.capiTag
        val dfpTag = tagProps.dfpTag

        val sponsorshipTag = {
          val maybeTagType = {
            if (capiTag.isSeries) Some(Series)
            else if (capiTag.isKeyword) Some(Keyword)
            else None
          }
          maybeTagType map (tagType => SponsorshipTag(tagType, tagId = capiTag.id))
        }

        ContainerCommercialOptions(
          isSponsored = dfpTag.paidForType == Sponsored,
          isPaidContainer = dfpTag.paidForType == AdvertisementFeature,
          isFoundationSupported = dfpTag.paidForType == FoundationFunded,
          hasPaidForContent = false,
          sponsor = dfpTag.lineItems.headOption flatMap (_.sponsor),
          sponsorshipTag,
          sponsorshipType = Some(dfpTag.paidForType.name),
          omitMPU = false
        )
      }

      item.properties.maybeContent flatMap (sponsoredTagPair(_) map mkFromSponsoredTagPair)
    }

    collection.items.headOption flatMap mkFromFirstItemInCollection getOrElse empty
  }

  val multi = ContainerCommercialOptions(
    isSponsored = false,
    isPaidContainer = false,
    isFoundationSupported = false,
    hasPaidForContent = true,
    sponsor = None,
    sponsorshipTag = None,
    sponsorshipType = None,
    omitMPU = false
  )

  val empty = ContainerCommercialOptions(
    isSponsored = false,
    isPaidContainer = false,
    isFoundationSupported = false,
    hasPaidForContent = false,
    sponsor = None,
    sponsorshipTag = None,
    sponsorshipType = None,
    omitMPU = false
  )

  def mostPopular(omitMPU: Boolean) = empty.copy(omitMPU = omitMPU)
}

case class ContainerCommercialOptions(
  isSponsored: Boolean,
  isPaidContainer: Boolean,
  isFoundationSupported: Boolean,
  hasPaidForContent: Boolean,
  sponsor: Option[String],
  sponsorshipTag: Option[SponsorshipTag],
  sponsorshipType: Option[String],
  omitMPU: Boolean
) {
  val isPaidFor = isSponsored || isPaidContainer || isFoundationSupported || hasPaidForContent
}

object FaciaContainer {
  def apply(
    index: Int,
    container: Container,
    config: CollectionConfigWithId,
    collectionEssentials: CollectionEssentials,
    componentId: Option[String] = None
  ): FaciaContainer = {
    apply(
      index,
      container,
      ContainerDisplayConfig.withDefaults(config),
      collectionEssentials,
      componentId
    )
  }

  def apply(
    index: Int,
    container: Container,
    config: ContainerDisplayConfig,
    collectionEssentials: CollectionEssentials,
    componentId: Option[String]
  ): FaciaContainer = fromConfig(
    index,
    container,
    config.collectionConfigWithId,
    collectionEssentials,
    ContainerLayout.fromContainer(
      container,
      ContainerLayoutContext.empty,
      config,
      collectionEssentials.items
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
    omitMPU: Boolean = false
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
      case MostPopular => ContainerCommercialOptions.mostPopular(omitMPU)
      case _ => ContainerCommercialOptions.fromConfig(config.config)
    },
    config.config.description.map(DescriptionMetaHeader),
    None,
    hideToggle = false,
    showTimestamps = false,
    None,
    useShowMore = true,
    hasShowMoreEnabled = !config.config.hideShowMore,
    showBranding = config.config.showBranding
  )

  def forStoryPackage(dataId: String, items: Seq[PressedContent], title: String, href: Option[String] = None) = {
    FaciaContainer(
      index = 2,
      container = Fixed(ContainerDefinition.fastForNumberOfItems(items.size)),
      config = ContainerDisplayConfig.withDefaults(CollectionConfigWithId(dataId, CollectionConfig.empty)),
      collectionEssentials = CollectionEssentials(items take 8, Nil, Some(title), href, None, None),
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
  showBranding: Boolean
) {
  def transformCards(f: ContentCard => ContentCard) = copy(
    containerLayout = containerLayout.map(_.transformCards(f))
  )

  def faciaComponentName = componentId getOrElse {
    displayName map { title: String =>
      title.toLowerCase.replace(" ", "-")
    } getOrElse "no-name"
  }

  def latestUpdate = (collectionEssentials.items.flatMap(_.card.webPublicationDateOption) ++
    collectionEssentials.lastUpdated.map(DateTime.parse)).sortBy(-_.getMillis).headOption

  def items = collectionEssentials.items

  def withTimeStamps = transformCards(_.withTimeStamp)

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

  def hasShowMore = containerLayout.exists(_.hasShowMore)

  def hasDesktopShowMore = containerLayout.exists(_.hasDesktopShowMore)

  def hasMobileOnlyShowMore =
    containerLayout.exists(layout => layout.hasMobileShowMore && !layout.hasDesktopShowMore)

  /** Nasty hardcoded thing.
    *
    * TODO: change Facia Tool to have a dropdown for 'header types', one of which is default, the other CP Scott.
    *
    * Then if we end up adding more of these over time, there's an in-built mechanism for doing so. Will also mean apps
    * can consume this data if they want to.
    */
  def showCPScottHeader = Set(
    "uk/commentisfree/regular-stories",
    "au/commentisfree/regular-stories"
  ).contains(dataId)

  def addShowMoreClasses() = useShowMore && containerLayout.exists(_.hasShowMore)

  def shouldLazyLoad = Switches.LazyLoadContainersSwitch.isSwitchedOn && index > 8

  def isStoryPackage = container match {
    case Dynamic(DynamicPackage) => true
    case _ => false
  }
}

case class DedupedItem(id: String)

case class DedupedContainerResult(
  containerId: String,
  containerDisplayName: String,
  deduped: List[DedupedItem],
  validForDedupingButNotDeduped: List[DedupedItem])

case class DedupedFrontResult(
  path: String,
  results: List[DedupedContainerResult]) {

  def addResult(result: DedupedContainerResult): DedupedFrontResult =
    this.copy(results = results :+ result)
}

object DedupedItem {
  implicit val dedupedItemFormat = Json.format[DedupedItem]
}

object DedupedContainerResult {
  implicit val dedupedContainerResultFormat = Json.format[DedupedContainerResult]
}

object DedupedFrontResult {
  implicit val dedupedFrontResultFormat = Json.format[DedupedFrontResult]
}

object Front extends implicits.Collections {
  type TrailUrl = String

  def itemsVisible(containerDefinition: ContainerDefinition) =
    containerDefinition.slices.flatMap(_.layout.columns.map(_.numItems)).sum

  // Never de-duplicate snaps.
  def participatesInDeduplication(faciaContent: PressedContent) = faciaContent.properties.embedType.isEmpty

  /** Given a set of already seen trail URLs, a container type, and a set of trails, returns a new set of seen urls
    * for further de-duplication and the sequence of trails in the order that they ought to be shown for that
    * container.
    */
  def deduplicate(
    seen: Set[TrailUrl],
    container: Container,
    faciaContentList: Seq[PressedContent]
    ): (Set[TrailUrl], Seq[PressedContent], (Seq[DedupedItem], Seq[DedupedItem])) = {
    container match {
      case Dynamic(dynamicContainer) =>
        /** Although Dynamic Containers participate in de-duplication, insofar as trails that appear in Dynamic
          * Containers will not be duplicated further down on the page, they themselves retain all their trails, no
          * matter what occurred further up the page.
          */
        dynamicContainer.containerDefinitionFor(
          faciaContentList.map(Story.fromFaciaContent)
        ) map { containerDefinition =>
          (seen ++ faciaContentList
            .map(_.header.url)
            .take(itemsVisible(containerDefinition)), faciaContentList, (Nil, Nil))
        } getOrElse {
          (seen, faciaContentList, (Nil, Nil))
        }

      /** Singleton containers (such as the eyewitness one or the thrasher one) do not participate in deduplication */
      case Fixed(containerDefinition) if containerDefinition.isSingleton =>
        (seen, faciaContentList, (Nil, Nil))

      case Fixed(containerDefinition) =>
        /** Fixed Containers participate in de-duplication.
          */
        val nToTake = itemsVisible(containerDefinition)
        val usedInThisIteration: Seq[PressedContent] =
          faciaContentList
            .filter(c => seen.contains(c.header.url))

       val usedButNotDeduped = usedInThisIteration
            .filter(c => !participatesInDeduplication(c))
            .map(_.header.url)
            .map(DedupedItem(_))

        val usedAndDeduped = usedInThisIteration
            .filter(participatesInDeduplication)
            .map(_.header.url)
            .map(DedupedItem(_))

        val notUsed = faciaContentList.filter(faciaContent => !seen.contains(faciaContent.header.url) || !participatesInDeduplication(faciaContent))
          .distinctBy(_.header.url)
        (seen ++ notUsed.take(nToTake).filter(participatesInDeduplication).map(_.header.url), notUsed, (usedAndDeduped, usedButNotDeduped))

      case _ =>
        /** Nav lists and most popular do not participate in de-duplication at all */
        (seen, faciaContentList, (Nil, Nil))
    }
  }

  def fromConfigsAndContainers(
    configs: Seq[((ContainerDisplayConfig, CollectionEssentials), Container)],
    initialContext: ContainerLayoutContext = ContainerLayoutContext.empty
  ) = {
    import scalaz.std.list._
    import scalaz.syntax.traverse._

    Front(
      configs.zipWithIndex.toList.mapAccumL(
        (Set.empty[TrailUrl], initialContext)
      ) { case ((seenTrails, context), (((config, collection), container), index)) =>

        //We don't need the used in the case of fromConfigsAndContainers
        val (newSeen, newItems, _) = deduplicate(seenTrails, container, collection.items)

        ContainerLayout.fromContainer(container, context, config, newItems) map {
          case (containerLayout, newContext) => ((newSeen, newContext), FaciaContainer.fromConfig(
            index,
            container,
            config.collectionConfigWithId,
            collection.copy(items = newItems),
            Some(containerLayout),
            None
          ))
        } getOrElse {
          ((newSeen, context), FaciaContainer.fromConfig(
            index,
            container,
            config.collectionConfigWithId,
            collection.copy(items = newItems),
            None,
            None
          ))
        }
      }._2.filterNot(_.items.isEmpty)
    )
  }

  def fromConfigs(configs: Seq[(CollectionConfigWithId, CollectionEssentials)]) = {
    fromConfigsAndContainers(configs.map {
      case (config, collectionEssentials) =>
        ((ContainerDisplayConfig.withDefaults(config), collectionEssentials), Container.fromConfig(config.config))
    })
  }

  def fromPressedPageWithDeduped(pressedPage: PressedPage,
                                 edition: Edition,
                                 initialContext: ContainerLayoutContext = ContainerLayoutContext.empty): ((Set[Front.TrailUrl], ContainerLayoutContext, DedupedFrontResult), List[FaciaContainer]) = {
    import scalaz.std.list._
    import scalaz.syntax.traverse._

    val emptyDedupedResultWithPath = DedupedFrontResult(pressedPage.id, Nil)

    pressedPage.collections.filterNot(_.curatedPlusBackfillDeduplicated.isEmpty).zipWithIndex.mapAccumL(
        (Set.empty[TrailUrl], initialContext, emptyDedupedResultWithPath)
      ) { case ((seenTrails, context, dedupedFrontResult), (pressedCollection, index)) =>
        val omitMPU = pressedPage.metadata.omitMPUsFromContainers(edition)
        val container = Container.fromPressedCollection(pressedCollection, omitMPU)
        val (newSeen, newItems, (usedAndDeduped, usedButNotDeduped)) = deduplicate(seenTrails, container, pressedCollection.curatedPlusBackfillDeduplicated)

        val dedupedContainerResult: DedupedContainerResult = DedupedContainerResult(pressedCollection.id, pressedCollection.displayName, usedAndDeduped.toList, usedButNotDeduped.toList)

        val collectionEssentials = CollectionEssentials.fromPressedCollection(pressedCollection)
        val containerDisplayConfig = ContainerDisplayConfig.withDefaults(pressedCollection.collectionConfigWithId)

        ContainerLayout.fromContainer(container, context, containerDisplayConfig, newItems) map {
          case (containerLayout, newContext) => ((newSeen, newContext, dedupedFrontResult.addResult(dedupedContainerResult)), FaciaContainer.fromConfig(
            index,
            container,
            pressedCollection.collectionConfigWithId,
            collectionEssentials.copy(items = newItems),
            Some(containerLayout),
            None
          ))
        } getOrElse {
          ((newSeen, context, dedupedFrontResult.addResult(dedupedContainerResult)), FaciaContainer.fromConfig(
            index,
            container,
            pressedCollection.collectionConfigWithId,
            collectionEssentials.copy(items = newItems),
            None,
            None,
            omitMPU
          ))
        }
    }
  }

  def fromPressedPage(pressedPage: PressedPage,
                      edition: Edition,
                      initialContext: ContainerLayoutContext = ContainerLayoutContext.empty): Front =
    Front(fromPressedPageWithDeduped(pressedPage, edition, initialContext)._2)

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
