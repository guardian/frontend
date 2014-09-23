package layout

import model.{Collection, Trail}
import slices.{ContainerDefinition, Slice}
import views.support.TemplateDeduping

object ContainerLayout extends implicits.Collections {
  def apply(sliceDefinitions: Seq[Slice], items: Seq[Trail], nToShowOnMobile: Int = 6): ContainerLayout = {
    val cards = items.zipWithIndex map {
      case (trail, index) => Card(
        index,
        trail,
        if (index >= nToShowOnMobile) Some(Mobile) else None
      )
    }

    val ContainerLayout(slices, showMore) = sliceDefinitions.foldLeft(ContainerLayout(Seq.empty, cards)) {
      case (s @ ContainerLayout(_, Nil), _) => s
      case (ContainerLayout(slicesSoFar, cardsForUse), sliceDefinition) =>
        val (slice, remainingCards) = SliceWithCards.fromItems(cards, sliceDefinition.layout)
        ContainerLayout(slicesSoFar :+ slice, remainingCards)
    }

    ContainerLayout(slices, showMore.map(_.copy(hideUpTo = Some(Desktop))))
  }

  def apply(containerDefinition: ContainerDefinition,
            collection: Collection,
            templateDeduping: TemplateDeduping): ContainerLayout = {
    /** TODO move this to earlier in the process, so that we can make the de-duping a functional transformation */
    val items = collection.items
    val numItems = containerDefinition.slices.flatMap(_.layout.columns.map(_.numItems)).sum
    val unusedTrailsForThisSlice = templateDeduping(numItems, items).take(numItems)
    val dedupedPrioritisedTrails = (unusedTrailsForThisSlice ++ items).distinctBy(_.url)

    apply(containerDefinition.slices, dedupedPrioritisedTrails, containerDefinition.numberOfCardsForMobile)
  }
}

case class ContainerLayout(
  slices: Seq[SliceWithCards],
  remainingCards: Seq[Card]
)
