package layout

import scalaz.syntax.std.option._

sealed trait Breakpoint {
  val minWidth: Option[Int]
}

// Please keep these in sync with:
//   stylesheets/_vars.scss
//   javascripts/utils/detect.js
case object Mobile extends Breakpoint {
  val minWidth = None
}

case object Tablet extends Breakpoint {
  val minWidth = 740.some
}

case object Desktop extends Breakpoint {
  val minWidth = 980.some
}
