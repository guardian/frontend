package layout

import cards._
import BrowserWidth._

object WidthsByBreakpoint {
  val Mobile = Map[CardType, BrowserWidth](
    MediaList -> 127.px,
    Standard -> 100.%
  )

  val Tablet = Map[CardType, BrowserWidth](
    Fluid -> 140.px,
    Standard -> 160.px,
    Third -> 220.px,
    Half -> 340.px,
    ThreeQuarters -> 340.px,
    ThreeQuartersRight -> 340.px,
    FullMedia50 -> 350.px,
    FullMedia75 -> 520.px,
    FullMedia100 -> 700.px
  )

  val Desktop = Map[CardType, BrowserWidth](
    Fluid -> 188.px,
    Standard -> 220.px,
    Third -> 300.px,
    Half -> 460.px,
    ThreeQuarters -> 460.px,
    ThreeQuartersRight -> 460.px,
    FullMedia50 -> 470.px,
    FullMedia75 -> 700.px,
    FullMedia100 -> 940.px
  )

  val Wide = Desktop

  def fromItemClasses(itemClasses: ItemClasses) = {
    val desktopClass = itemClasses.desktop.getOrElse(itemClasses.tablet)

    WidthsByBreakpoint(
      Mobile.get(itemClasses.mobile),
      Tablet.get(itemClasses.tablet),
      Desktop.get(desktopClass),
      Wide.get(desktopClass)
    )
  }
}

case class WidthsByBreakpoint(
  mobile: Option[BrowserWidth],
  tablet: Option[BrowserWidth],
  desktop: Option[BrowserWidth],
  wide: Option[BrowserWidth]
) {

}
