package layout

import views.support.CutOut

sealed trait Breakpoint

case object Mobile extends Breakpoint
case object Desktop extends Breakpoint

/** TODO refactor this to be FaciaCardAndIndex and move important stuff to FaciaCard */
case class Card(
  index: Int,
  item: FaciaCard,
  hideUpTo: Option[Breakpoint],
  /** TODO get rid of this, it's in FaciaCard */
  cutOut: Option[CutOut]
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
