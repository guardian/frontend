package layout

import model.Trail

sealed trait Breakpoint

case object Mobile extends Breakpoint
case object Desktop extends Breakpoint

case class Card(
  index: Int,
  item: Trail,
  hideUpTo: Option[Breakpoint]
) {
  def cssClasses = hideUpTo match {
    case Some(Mobile) => "fc-show-more__hide-on-mobile"
    case Some(Desktop) => "fc-show-more__hide"
    case _ => ""
  }
}
