package layout

import model.Trail
import slices.{ContainerDefinition, RestrictTo, MobileShowMore, Slice}

object ContainerLayout extends implicits.Collections {
  def apply(sliceDefinitions: Seq[Slice], items: Seq[Trail], mobileShowMore: MobileShowMore): ContainerLayout = {
    val cards = items.zipWithIndex map {
      case (trail, index) => Card(
        index,
        trail,
        mobileShowMore match {
          case RestrictTo(nToShowOnMobile) if index >= nToShowOnMobile => Some(Mobile)
          case _ => None
        }
      )
    }

    val ContainerLayout(slices, showMore) = sliceDefinitions.foldLeft(ContainerLayout(Seq.empty, cards)) {
      case (s @ ContainerLayout(_, Nil), _) => s
      case (ContainerLayout(slicesSoFar, cardsForUse), sliceDefinition) =>
        val (slice, remainingCards) = SliceWithCards.fromItems(cardsForUse, sliceDefinition.layout)
        ContainerLayout(slicesSoFar :+ slice, remainingCards)
    }

    ContainerLayout(slices, showMore.map(_.copy(hideUpTo = Some(Desktop))))
  }

  def fromContainerDefinition(containerDefinition: ContainerDefinition, items: Seq[Trail]) =
    apply(containerDefinition.slices, items, containerDefinition.mobileShowMore)
}

case class ContainerLayout(
  slices: Seq[SliceWithCards],
  remainingCards: Seq[Card]
)
