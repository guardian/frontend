package layout

import com.gu.facia.client.models.CollectionConfig
import model.Trail

sealed trait Breakpoint

case object Mobile extends Breakpoint
case object Desktop extends Breakpoint

object FaciaCardAndIndex {
  /** If creating a Card off the cuff (i.e., outside of the normal Facia front construction code */
  def fromTrail(trail: Trail, itemClasses: ItemClasses, index: Int) = FaciaCardAndIndex(
    index,
    FaciaCard.fromTrail(
      trail,
      CollectionConfig.emptyConfig,
      itemClasses,
      showSeriesAndBlogKickers = false
    ),
    None
  )
}

case class FaciaCardAndIndex(
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

  def transformCard(f: FaciaCard => FaciaCard) = copy(item = f(item))
}
