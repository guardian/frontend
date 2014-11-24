package layout

import com.gu.facia.client.models.CollectionConfig
import dfp.DfpAgent
import model._
import org.joda.time.DateTime
import services.CollectionConfigWithId
import slices._
import views.support.CutOut
import scala.Function._
import slices.MostPopular

/** For de-duplicating cutouts */
object ContainerLayoutContext {
  val empty = ContainerLayoutContext(Set.empty, false)
}

case class ContainerLayoutContext(
  cutOutsSeen: Set[CutOut],
  hideCutOuts: Boolean
) {
  def addCutOuts(cutOut: Set[CutOut]) = copy(cutOutsSeen = cutOutsSeen ++ cutOut)

  def transform(card: FaciaCardAndIndex) = {
    if (hideCutOuts) {
      (card.copy(item = card.item.copy(cutOut = None)), this)
    } else {
      // Latest snaps are sometimes used to promote journalists, and the cut out should always show on these snaps.
      if (card.item.snapStuff.snapType == LatestSnap) {
        (card, this)
      } else {
        val newCard = if (card.item.cutOut.exists(cutOutsSeen.contains)) {
          card.copy(item = card.item.copy(cutOut = None))
        } else {
          card
        }
        (newCard, addCutOuts(card.item.cutOut.filter(const(card.item.cardTypes.showCutOut)).toSet))
      }
    }
  }
}

object Front extends implicits.Collections {
  type TrailUrl = String

  def itemsVisible(containerDefinition: ContainerDefinition) =
    containerDefinition.slices.flatMap(_.layout.columns.map(_.numItems)).sum

  // Dream on.
  def participatesInDeduplication(trail: Trail) =
    !trail.snapType.exists(_ == "latest")

  /** Given a set of already seen trail URLs, a container type, and a set of trails, returns a new set of seen urls
    * for further de-duplication and the sequence of trails in the order that they ought to be shown for that
    * container.
    */
  def deduplicate(
    seen: Set[TrailUrl],
    container: Container,
    trails: Seq[Trail]
  ): (Set[TrailUrl], Seq[Trail]) = {
    container match {
      case Dynamic(dynamicContainer) =>
        /** Although Dynamic Containers participate in de-duplication, insofar as trails that appear in Dynamic
          * Containers will not be duplicated further down on the page, they themselves retain all their trails, no
          * matter what occurred further up the page.
          */
        dynamicContainer.containerDefinitionFor(
          trails.collect({ case content: Content => content }).map(Story.fromContent)
        ) map { containerDefinition =>
          (seen ++ trails
            .map(_.url)
            .take(itemsVisible(containerDefinition)), trails)
        } getOrElse {
          (seen, trails)
        }

      case Fixed(containerDefinition) =>
        /** Fixed Containers participate in de-duplication.
          */
        val nToTake = itemsVisible(containerDefinition)
        val notUsed = trails.filterNot(trail => participatesInDeduplication(trail) && seen.contains(trail.url))
          .distinctBy(_.url)
        (seen ++ notUsed.filter(participatesInDeduplication).take(nToTake).map(_.url), notUsed)

      case _ =>
        /** Nav lists and most popular do not participate in de-duplication at all */
        (seen, trails)
    }
  }

  def fromConfigsAndContainers(
      configs: Seq[((ContainerDisplayConfig, CollectionEssentials), Container)],
      initialContext: ContainerLayoutContext = ContainerLayoutContext.empty
  ) = {
    import scalaz.syntax.traverse._
    import scalaz.std.list._

    Front(
      configs.zipWithIndex.toList.mapAccumL(
        (Set.empty[TrailUrl], initialContext)
      ) { case ((seenTrails, context), (((config, collection), container), index)) =>
        val (newSeen, newItems) = deduplicate(seenTrails, container, collection.items)

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
}

object CollectionEssentials {
  def fromCollection(collection: Collection) = CollectionEssentials(
    collection.items,
    collection.displayName,
    collection.href,
    collection.lastUpdated,
    if (collection.curated.isEmpty) Some(9) else None
  )

  def fromTrails(trails: Seq[Trail]) = CollectionEssentials(
    trails,
    None,
    None,
    None,
    None
  )
}

case class CollectionEssentials(
  items: Seq[Trail],
  displayName: Option[String],
  href: Option[String],
  lastUpdated: Option[String],
  showMoreLimit: Option[Int]
)

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
    componentId: Option[String]
  ): FaciaContainer = FaciaContainer(
    index,
    config.id,
    config.config.displayName orElse collectionEssentials.displayName,
    config.config.href orElse collectionEssentials.href,
    componentId,
    container,
    collectionEssentials,
    containerLayout,
    config.config.showDateHeader.exists(identity),
    config.config.showLatestUpdate.exists(identity),
    // popular containers should never be sponsored
    container match {
      case MostPopular => ContainerCommercialOptions.empty
      case _ => ContainerCommercialOptions.fromConfig(config.config)
    },
    None,
    None,
    false,
    false,
    None
  )

  def forStoryPackage(dataId: String, items: Seq[Trail], title: String) = {
    FaciaContainer(
      index = 2,
      container = Fixed(ContainerDefinition.forNumberOfItems(items.size)),
      config = ContainerDisplayConfig.withDefaults(CollectionConfigWithId(dataId, CollectionConfig.emptyConfig)),
      collectionEssentials = CollectionEssentials(items take 8, Some(title), None, None, None),
      componentId = None
    ).withTimeStamps
  }
}

object ContainerCommercialOptions {
  def fromConfig(config: CollectionConfig) = ContainerCommercialOptions(
    DfpAgent.isSponsored(config),
    DfpAgent.isAdvertisementFeature(config),
    DfpAgent.isFoundationSupported(config),
    DfpAgent.sponsorshipTag(config),
    DfpAgent.sponsorshipType(config)
  )

  def fromMetaData(metaData: MetaData) = ContainerCommercialOptions(
    metaData.isSponsored,
    metaData.isAdvertisementFeature,
    metaData.isFoundationSupported,
    metaData.sponsor,
    metaData.sponsorshipType
  )

  val empty = ContainerCommercialOptions(
    false,
    false,
    false,
    None,
    None
  )
}

case class ContainerCommercialOptions(
  isSponsored: Boolean,
  isAdvertisementFeature: Boolean,
  isFoundationSupported: Boolean,
  sponsorshipTag: Option[String],
  sponsorshipType: Option[String]
) {
  val isPaidFor = isSponsored || isAdvertisementFeature || isFoundationSupported
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
  dateLinkPath: Option[String]
) {
  def transformCards(f: FaciaCard => FaciaCard) = copy(
    containerLayout = containerLayout.map(_.transformCards(f))
  )

  def faciaComponentName = componentId getOrElse {
    displayName map { title: String =>
      title.toLowerCase.replace(" ", "-")
    } getOrElse "no-name"
  }

  def latestUpdate = (collectionEssentials.items.map(_.webPublicationDate) ++
    collectionEssentials.lastUpdated.map(DateTime.parse(_))).sortBy(-_.getMillis).headOption

  def items = collectionEssentials.items

  def contentItems = items collect { case c: Content => c }

  def withTimeStamps = transformCards(_.withTimeStamp)

  def dateLink: Option[String] = {
    val maybeDateHeadline = customHeader map {
      case MetaDataHeader(_, _, _, dateHeadline) => dateHeadline
      case LoneDateHeadline(dateHeadline) => dateHeadline
    }

    for {
      path <- dateLinkPath
      dateHeadline <- maybeDateHeadline
      urlFragment <- dateHeadline.urlFragment
    } yield s"$path/$urlFragment/all"
  }
}

case class Front(
  containers: Seq[FaciaContainer]
)
