package layout

import scalaz.syntax.std.option._

trait Breakpoint {
  val minWidth: Option[Int]
}

// Please keep minWidths in sync with:
//   stylesheets/_vars.scss
//   javascripts/utils/detect.js
case object Mobile extends Breakpoint {
  val minWidth = None
}

case object MobileLandscape extends Breakpoint {
  val minWidth = 480.some
}

case object Phablet extends Breakpoint {
  val minWidth = 660.some
}

case object Tablet extends Breakpoint {
  val minWidth = 740.some
}

case object Desktop extends Breakpoint {
  val minWidth = 980.some
}

case object LeftCol extends Breakpoint {
  val minWidth = 1140.some
}

case object Wide extends Breakpoint {
  val minWidth = 1300.some
}
