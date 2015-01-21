package layout

import cards._
import BrowserWidth._
import scalaz.syntax.std.option._

object WidthsByBreakpoint {
  val Mobile = Map[CardType, BrowserWidth](
    (MediaList, 127.px),
    (Standard, 100.perc)
  )

  val Tablet = Map[CardType, BrowserWidth](
    (Fluid, 140.px),
    (Standard, 160.px),
    (Third, 220.px),
    (Half, 340.px),
    (ThreeQuarters, 340.px),
    (ThreeQuartersRight, 340.px),
    (FullMedia50, 350.px),
    (FullMedia75, 520.px),
    (FullMedia100, 700.px)
  )

  val Desktop = Map[CardType, BrowserWidth](
    (Fluid, 188.px),
    (Standard, 220.px),
    (Third, 300.px),
    (Half, 460.px),
    (ThreeQuarters, 460.px),
    (ThreeQuartersRight, 460.px),
    (FullMedia50, 470.px),
    (FullMedia75, 700.px),
    (FullMedia100, 940.px)
  )

  def fromItemClasses(itemClasses: ItemClasses) = {
    val desktopClass = itemClasses.desktop.getOrElse(itemClasses.tablet)

    WidthsByBreakpoint(
      Mobile.get(itemClasses.mobile),
      Tablet.get(itemClasses.tablet),
      Desktop.get(desktopClass)
    )
  }
}

case class WidthsByBreakpoint(
  mobile: Option[BrowserWidth],
  tablet: Option[BrowserWidth],
  desktop: Option[BrowserWidth]
) {
  // as used by the 'sizes' attribute of img
  def sizesString =
    Seq(desktop, tablet, mobile) zip Seq(980.some, 740.some, None) collect {
      case (Some(imageWidth), Some(breakpoint)) =>
        s"(min-width ${breakpoint}px) $imageWidth"

      case (Some(imageWidth), None) =>
        imageWidth.toString
    } mkString ", "
}
