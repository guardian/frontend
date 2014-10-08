package layout

import model.{Collection, Trail}
import slices.{RestrictTo, MobileShowMore, ContainerDefinition, Slice}
import views.support.TemplateDeduping

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

  def apply(containerDefinition: ContainerDefinition,
            collection: Collection,
            maybeTemplateDeduping: Option[TemplateDeduping]): ContainerLayout = {
    /** TODO move this to earlier in the process, so that we can make the de-duping a functional transformation */
    val items = collection.items

    val trails = maybeTemplateDeduping map { templateDeduping =>
      val numItems = containerDefinition.slices.flatMap(_.layout.columns.map(_.numItems)).sum
      val unusedTrailsForThisSlice = templateDeduping(numItems, items).take(numItems)
      (unusedTrailsForThisSlice ++ items).distinctBy(_.url)
    } getOrElse items

    val layout = apply(containerDefinition.slices, trails, containerDefinition.mobileShowMore)

    //Cap the remaining card size to 9 only on automated collections
    if (collection.curated.isEmpty) {
      layout.copy(remainingCards = layout.remainingCards.take(9))
    } else {
      layout
    }
  }
}

case class ContainerLayout(
  slices: Seq[SliceWithCards],
  remainingCards: Seq[Card]
)
