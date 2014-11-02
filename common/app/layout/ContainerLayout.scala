package layout

import com.gu.facia.client.models.CollectionConfig
import model.{Content, Trail}
import slices._

case class IndexedTrail(trail: Trail, index: Int)

object ContainerLayout extends implicits.Collections {
  def apply(
      sliceDefinitions: Seq[Slice],
      items: Seq[Trail],
      config: CollectionConfig,
      mobileShowMore: MobileShowMore
  ): ContainerLayout = {
    val indexedTrails = items.zipWithIndex.map((IndexedTrail.apply _).tupled)

    val (slices, showMore) = sliceDefinitions.foldLeft((Seq.empty[SliceWithCards], indexedTrails)) {
      case ((slicesSoFar, Nil), _) => (slicesSoFar, Nil)
      case ((slicesSoFar, trailsForUse), sliceDefinition) =>
        val (slice, remainingTrails) = SliceWithCards.fromItems(
          trailsForUse,
          sliceDefinition.layout,
          config,
          mobileShowMore
        )
        (slicesSoFar :+ slice, remainingTrails)
    }

    ContainerLayout(slices, showMore map { case IndexedTrail(trail, index) =>
      Card(
        index,
        FaciaCard.fromTrail(trail, config, ItemClasses.showMore),
        hideUpTo = Some(Desktop)
      )
    })
  }

  def fromContainerDefinition(containerDefinition: ContainerDefinition, config: CollectionConfig, items: Seq[Trail]) =
    apply(containerDefinition.slices, items, config, containerDefinition.mobileShowMore)

  def fromContainer(container: Container, config: CollectionConfig, items: Seq[Trail]) =
    ContainerDefinition.fromContainer(container, items collect { case c: Content => c }) map {
      case definition: ContainerDefinition => fromContainerDefinition(definition, config, items)
    }
}

case class ContainerLayout(
  slices: Seq[SliceWithCards],
  remainingCards: Seq[Card]
)
