package layout

import cards._
import BrowserWidth._
import views.support.Profile
import scalaz.syntax.std.option._

object WidthsByBreakpoint {
  val Mobile = Map[CardType, BrowserWidth](
    (MediaList, 127.px),
    (Standard, 100.perc)
  )

  val Tablet = Map[CardType, BrowserWidth](
    (MediaList, 140.px),
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
    (MediaList, 140.px),
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
  def breakpoints = Seq(
    Desktop,
    Tablet,
    Mobile
  ) zip Seq(desktop, tablet, mobile) map BreakpointWidth.tupled

  val MaximumMobileImageWidth = 620
  val SourcesToEmitOnMobile = 3

  def sizesString = breakpoints collect {
    case BreakpointWidth(Mobile, Some(imageWidth)) =>
      imageWidth.toString

    case BreakpointWidth(breakpoint, Some(imageWidth)) =>
      s"(min-width: ${breakpoint.minWidth.get}px) $imageWidth"
  } mkString ", "

  def maxWidth = {
    (Seq(desktop, tablet, mobile) collect {
      case Some(PixelWidth(pixels)) => pixels
      case Some(PercentageWidth(_)) => Mobile.maxImageWidth.get
    }).max
  }

  def sources = breakpoints flatMap {
    case BreakpointWidth(breakpoint, Some(PixelWidth(pixels))) =>
      Seq(
        Source(breakpoint.minWidth, pixels)
      )

    case BreakpointWidth(Mobile, Some(PercentageWidth(percentage))) =>
      val widths = Profile.imageWidths.sorted.reverse.dropWhile(_ > MaximumMobileImageWidth).take(SourcesToEmitOnMobile)
      val minWidths = widths.map(_.some).drop(1) ++ Seq(None)

      (widths zip minWidths) map { case (width, minWidth) =>
        Source(minWidth, width)
      }

    case _ => Seq.empty
  }
}

case class Source(minWidth: Option[Int], pixelWidth: Int)

case class BreakpointWidth(breakpoint: Breakpoint, width: Option[BrowserWidth])
