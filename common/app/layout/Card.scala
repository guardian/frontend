package layout

import com.gu.facia.client.models.CollectionConfig
import model.Trail
import views.support.CutOut

sealed trait Breakpoint

case object Mobile extends Breakpoint
case object Desktop extends Breakpoint

object Card {
  /** If creating a Card off the cuff (i.e., outside of the normal Facia front construction code */
  def fromTrail(trail: Trail, itemClasses: ItemClasses, index: Int) = Card(
    index,
    FaciaCard.fromTrail(trail, CollectionConfig.emptyConfig, itemClasses),
    None
  )
}

/** TODO refactor this to be FaciaCardAndIndex and move important stuff to FaciaCard */
case class Card(
  index: Int,
  item: FaciaCard,
  hideUpTo: Option[Breakpoint]
) {
  def cssClasses = hideUpTo match {
    case Some(Mobile) => "fc-show-more--hide-on-mobile js-hide-on-mobile"
    case Some(Desktop) => "fc-show-more--hide js-hide"
    case _ => ""
  }

  def visibilityDataAttribute = hideUpTo match {
    case Some(Mobile) => "desktop"
    case Some(Desktop) => "hidden"
    case _ => "all"
  }
}
