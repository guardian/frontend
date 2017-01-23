package layout

sealed trait Breakpoint {
  val minWidth: Option[Int]
}

// Please keep minWidths in sync with:
//   stylesheets/_vars.scss
//   javascripts/utils/detect.js
case object Mobile extends Breakpoint {
  val minWidth = None
}

case object MobileMedium extends Breakpoint {
  val minWidth = Some(375)
}

case object MobileLandscape extends Breakpoint {
  val minWidth = Some(480)
}

case object Phablet extends Breakpoint {
  val minWidth = Some(660)
}

case object Tablet extends Breakpoint {
  val minWidth = Some(740)
}

case object Desktop extends Breakpoint {
  val minWidth = Some(980)
}

case object LeftCol extends Breakpoint {
  val minWidth = Some(1140)
}

case object Wide extends Breakpoint {
  val minWidth = Some(1300)
}
