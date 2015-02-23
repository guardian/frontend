package layout

import cards._
import BrowserWidth._
import views.support.Profile
import scalaz.syntax.std.option._

object WidthsByBreakpoint {
  val MediaMobile = Map[CardType, BrowserWidth](
    (MediaList, 127.px),
    (Standard, 100.perc)
  )

  val CutOutMobile = Map[CardType, BrowserWidth](
    (MediaList, 115.px),
    (Standard, 130.px)
  )

  val MediaTablet = Map[CardType, BrowserWidth](
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

  val CutOutTablet = Map[CardType, BrowserWidth](
    (MediaList, 115.px),
    (Standard, 216.px),
    (Third, 187.px),
    (Half, 331.px),
    (ThreeQuarters, 331.px),
    (ThreeQuartersRight, 331.px),
    (FullMedia50, 331.px),
    (FullMedia75, 331.px),
    (FullMedia100, 331.px)
  )

  val MediaDesktop = Map[CardType, BrowserWidth](
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

  val CutOutDesktop = Map[CardType, BrowserWidth](
    (MediaList, 115.px),
    (Standard, 216.px),
    (Third, 216.px),
    (Half, 331.px),
    (ThreeQuarters, 389.px),
    (ThreeQuartersRight, 389.px),
    (FullMedia50, 331.px),
    (FullMedia75, 331.px),
    (FullMedia100, 331.px)
  )

  def mediaFromItemClasses(itemClasses: ItemClasses) = {
    val desktopClass = itemClasses.desktop.getOrElse(itemClasses.tablet)

    WidthsByBreakpoint(
      MediaMobile.get(itemClasses.mobile),
      MediaTablet.get(itemClasses.tablet),
      MediaDesktop.get(desktopClass)
    )
  }

  def cutOutFromItemClasses(itemClasses: ItemClasses) = {
    val desktopClass = itemClasses.desktop.getOrElse(itemClasses.tablet)

    WidthsByBreakpoint(
      CutOutMobile.get(itemClasses.mobile),
      CutOutTablet.get(itemClasses.tablet),
      CutOutDesktop.get(desktopClass)
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
