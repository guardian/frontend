package layout

import com.gu.facia.client.models.CollectionConfig
import model.{Content, Trail}
import slices._

case class IndexedTrail(trail: Trail, index: Int)

object ContainerLayout extends implicits.Collections {
  def apply(
      sliceDefinitions: Seq[Slice],
      items: Seq[Trail],
      initialContext: ContainerLayoutContext,
      config: CollectionConfig,
      mobileShowMore: MobileShowMore
  ): (ContainerLayout, ContainerLayoutContext) = {
    val indexedTrails = items.zipWithIndex.map((IndexedTrail.apply _).tupled)

    val (slices, showMore, finalContext) = sliceDefinitions.foldLeft(
      (Seq.empty[SliceWithCards], indexedTrails, initialContext)
    ) {
      case ((slicesSoFar, Nil, context), _) => (slicesSoFar, Nil, context)
      case ((slicesSoFar, trailsForUse, context), sliceDefinition) =>
        val (slice, remainingTrails, newContext) = SliceWithCards.fromItems(
          trailsForUse,
          sliceDefinition.layout,
          context,
          config,
          mobileShowMore
        )
        (slicesSoFar :+ slice, remainingTrails, newContext)
    }

    (ContainerLayout(slices, showMore map { case IndexedTrail(trail, index) =>
      FaciaCardAndIndex(
        index,
        FaciaCard.fromTrail(trail, config, ItemClasses.showMore),
        hideUpTo = Some(Desktop)
      )
    }), finalContext)
  }

  def singletonFromContainerDefinition(
    containerDefinition: ContainerDefinition,
    config: CollectionConfig,
    items: Seq[Trail]
  ) = fromContainerDefinition(
    containerDefinition,
    ContainerLayoutContext.empty,
    config,
    items
  )._1

  def fromContainerDefinition(
      containerDefinition: ContainerDefinition,
      containerLayoutContext: ContainerLayoutContext,
      config: CollectionConfig,
      items: Seq[Trail]
  ) = apply(
      containerDefinition.slices,
      items,
      containerLayoutContext,
      config,
      containerDefinition.mobileShowMore
    )

  def fromContainer(
      container: Container,
      containerLayoutContext: ContainerLayoutContext,
      config: CollectionConfig,
      items: Seq[Trail]
  ) =
    ContainerDefinition.fromContainer(container, items collect { case c: Content => c }) map {
      case definition: ContainerDefinition =>
        fromContainerDefinition(definition, containerLayoutContext, config, items)
    }
}

case class ContainerLayout(
  slices: Seq[SliceWithCards],
  remainingCards: Seq[FaciaCardAndIndex]
) {
  def transformCards(f: FaciaCard => FaciaCard) = copy(
    slices = slices.map(_.transformCards(f)),
    remainingCards.map(cardAndIndex => cardAndIndex.transformCard(f))
  )
}
