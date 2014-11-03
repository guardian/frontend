package layout

import com.gu.facia.client.models.{CollectionConfig, Config}
import model.{Collection, Content, Trail}
import org.joda.time.DateTime
import services.CollectionConfigWithId
import slices._

object Front extends implicits.Collections {
  type TrailUrl = String

  def itemsVisible(containerDefinition: ContainerDefinition) =
    containerDefinition.slices.flatMap(_.layout.columns.map(_.numItems)).sum

  /** Given a set of already seen trail URLs, a container type, and a set of trails, returns a new set of seen urls
    * for further de-duplication and the sequence of trails in the order that they ought to be shown for that
    * container.
    */
  def deduplicate(seen: Set[TrailUrl], container: Container, trails: Seq[Trail]): (Set[TrailUrl], Seq[Trail]) = {
    container match {
      case Dynamic(dynamicContainer) =>
        /** Although Dynamic Containers participate in de-duplication, insofar as trails that appear in Dynamic
          * Containers will not be duplicated further down on the page, they themselves retain all their trails, no
          * matter what occurred further up the page.
          */
        dynamicContainer.containerDefinitionFor(
          trails.collect({ case content: Content => content }).map(Story.fromContent)
        ) map { containerDefinition =>
          (seen ++ trails.map(_.url).take(itemsVisible(containerDefinition)), trails)
        } getOrElse {
          (seen, trails)
        }

      case Fixed(containerDefinition) =>
        /** Fixed Containers participate in de-duplication.
          *
          * If any items in the container have appeared previously, they're shoved to the end of the container (the idea
          * being that they disappear beyond the fold, i.e., after the 'show more' button).
          */
        val nToTake = itemsVisible(containerDefinition)
        val notUsed = trails.filterNot(trail => seen.contains(trail.url)).distinctBy(_.url)
        (seen ++ notUsed.take(nToTake).map(_.url), notUsed)

      case _ =>
        /** Nav lists and most popular do not participate in de-duplication at all */
        (seen, trails)
    }
  }

  def fromConfigs(configs: Seq[(CollectionConfigWithId, CollectionEssentials)]) = {
    import scalaz.syntax.traverse._
    import scalaz.std.list._

    Front(configs.zipWithIndex.toList.mapAccumL(Set.empty[TrailUrl]) { case (seen, ((config, collection), index)) =>
      val container = Container.fromConfig(config.config)

      val (newSeen, newItems) = deduplicate(seen, container, collection.items)
      (newSeen, ContainerAndCollection(index, container, config, collection.copy(items = newItems)))
    }._2.filterNot(_.items.isEmpty))
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

object ContainerAndCollection {
  def forStoryPackage(dataId: String, items: Seq[Trail], title: String) = {
    val layout: ContainerDefinition = items.size match {
      case 1 => FixedContainers.fixedSmallSlowI
      case 2 => FixedContainers.fixedSmallSlowII
      case 3 => FixedContainers.fixedMediumSlowXIIMpu
      case 5 => FixedContainers.fixedSmallSlowVI
      case _ => FixedContainers.fixedMediumFastXII
    }
    ContainerAndCollection(
      index = 2,
      container = Fixed(layout),
      config = CollectionConfigWithId(dataId, CollectionConfig.emptyConfig),
      CollectionEssentials(items take 8, Some(title), None, None, None)
    )
  }
}

case class ContainerAndCollection(
  index: Int,
  container: Container,
  config: CollectionConfigWithId,
  collectionEssentials: CollectionEssentials
) {
  def dataId = config.id

  def displayName = config.config.displayName orElse collectionEssentials.displayName

  def href = config.config.href orElse collectionEssentials.href

  def faciaComponentName = displayName map { title: String =>
    title.toLowerCase.replace(" ", "-")
  } getOrElse "no-name"

  def showDateHeader = config.config.showDateHeader.exists(identity)

  def showLatestUpdate = config.config.showLatestUpdate.exists(identity)

  def latestUpdate = (collectionEssentials.items.map(_.webPublicationDate) ++
    collectionEssentials.lastUpdated.map(DateTime.parse(_))).sortBy(-_.getMillis).headOption

  /** Slice-based containers have a definition, which deals with layout & show more, etc. */
  def containerDefinition = container match {
    case Dynamic(dynamicContainer) =>
      dynamicContainer.containerDefinitionFor(
        collectionEssentials.items.collect({ case c: Content => c }).map(Story.fromContent)
      )

    case Fixed(containerDefinition) => Some(containerDefinition)

    case _ => None
  }

  def containerLayout = containerDefinition map { definition =>
    ContainerLayout(definition.slices, collectionEssentials.items, definition.mobileShowMore)
  }

  def items = collectionEssentials.items

  def contentItems = items collect { case c: Content => c }
}

case class Front(
  containers: Seq[ContainerAndCollection]
)
