package layout

import common.{Edition, LinkTo}
import model.PressedPage
import model.facia.PressedCollection
import model.meta.{ItemList, ListItem}
import model.pressed.PressedContent
import play.api.mvc.RequestHeader
import slices._

import scala.annotation.tailrec

case class Front(
    containers: Seq[FaciaContainer],
)

object Front {
  type TrailUrl = String

  def itemsVisible(containerDefinition: ContainerDefinition): Int =
    itemsVisible(containerDefinition.slices)

  def itemsVisible(slices: Seq[Slice]): Int =
    slices.flatMap(_.layout.columns.map(_.numItems)).sum

  // Never de-duplicate snaps.
  def participatesInDeduplication(faciaContent: PressedContent): Boolean = faciaContent.properties.embedType.isEmpty

  def fromConfigsAndContainers(
      configs: Seq[((ContainerDisplayConfig, CollectionEssentials), Container)],
      initialContext: ContainerLayoutContext = ContainerLayoutContext.empty,
  ): Front = {

    @tailrec
    def faciaContainers(
        allConfigs: Seq[((ContainerDisplayConfig, CollectionEssentials), Container)],
        context: ContainerLayoutContext,
        index: Int = 0,
        accumulation: Vector[FaciaContainer] = Vector.empty,
    ): Seq[FaciaContainer] = {
      allConfigs.toList match {
        case Nil => accumulation
        case ((config, collection), container) :: remainingConfigs =>
          val newItems = collection.items.distinctBy(_.header.url)
          val layoutMaybe = ContainerLayout.fromContainer(container, context, config, newItems, hasMore = false)
          val newContext = layoutMaybe.map(_._2).getOrElse(context)
          val faciaContainer = FaciaContainer.fromConfigAndAdSpecs(
            index,
            container,
            config.collectionConfigWithId,
            collection.copy(items = newItems),
            layoutMaybe.map(_._1),
            None,
          )
          faciaContainers(remainingConfigs, newContext, index + 1, accumulation :+ faciaContainer)
      }
    }

    Front(
      faciaContainers(configs, initialContext).filterNot(_.items.isEmpty),
    )
  }

  def fromPressedPageWithDeduped(
      pressedPage: PressedPage,
      edition: Edition,
      initialContext: ContainerLayoutContext = ContainerLayoutContext.empty,
      adFree: Boolean,
  ): Seq[FaciaContainer] = {

    @tailrec
    def faciaContainers(
        collections: List[PressedCollection],
        context: ContainerLayoutContext,
        index: Int = 0,
        accumulation: Seq[FaciaContainer] = Vector.empty[FaciaContainer],
    ): Seq[FaciaContainer] = {

      collections match {
        case Nil => accumulation
        case pressedCollection :: remainingPressedCollections =>
          val container: Container = Container.fromPressedCollection(pressedCollection, adFree)
          val newItems = pressedCollection.distinct

          val collectionEssentials = CollectionEssentials.fromPressedCollection(pressedCollection)
          val containerDisplayConfig = ContainerDisplayConfig.withDefaults(pressedCollection.collectionConfigWithId)

          val containerLayoutMaybe: Option[(ContainerLayout, ContainerLayoutContext)] = ContainerLayout.fromContainer(
            container,
            context,
            containerDisplayConfig,
            newItems,
            pressedCollection.hasMore,
          )
          val newContext: ContainerLayoutContext = containerLayoutMaybe.map(_._2).getOrElse(context)
          val faciaContainer = FaciaContainer.fromConfigAndAdSpecs(
            index,
            container,
            pressedCollection.collectionConfigWithId,
            collectionEssentials.copy(items = newItems),
            containerLayoutMaybe.map(_._1),
            None,
            adFree = adFree,
            targetedTerritory = pressedCollection.targetedTerritory,
          )

          faciaContainers(
            remainingPressedCollections,
            newContext,
            index + 1,
            accumulation :+ faciaContainer,
          )
      }
    }

    faciaContainers(
      pressedPage.collections.filterNot(_.curatedPlusBackfillDeduplicated.isEmpty),
      initialContext,
    )
  }

  def fromPressedPage(
      pressedPage: PressedPage,
      edition: Edition,
      initialContext: ContainerLayoutContext = ContainerLayoutContext.empty,
      adFree: Boolean,
  ): Front =
    Front(fromPressedPageWithDeduped(pressedPage, edition, initialContext, adFree))

  def makeLinkedData(url: String, collections: Seq[FaciaContainer])(implicit request: RequestHeader): ItemList = {
    ItemList(
      url = LinkTo(url),
      itemListElement = collections.zipWithIndex.map { case (collection, index) =>
        ListItem(
          position = index,
          item = Some(
            ItemList(
              url = LinkTo(url), // don't have a uri for each container
              itemListElement = collection.items.zipWithIndex.map { case (item, i) =>
                ListItem(position = i, url = Some(LinkTo(item.header.url)))
              },
            ),
          ),
        )
      },
    )
  }
}
