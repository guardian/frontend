package layout

import cards._
import BrowserWidth._

object FaciaWidths {
  private val MediaMobile = Map[CardType, BrowserWidth](
    (MediaList, 127.px),
    (Standard, 95.vw),
  )

  val ExtraPixelWidthsForMediaMobile: Seq[PixelWidth] = List(
    445.px, // largest width for mobile breakpoint
    605.px, // largest width for mobile landscape breakpoint
  )

  private val CutOutMobile = Map[CardType, BrowserWidth](
    (MediaList, 115.px),
    (Standard, 130.px),
  )

  private val MediaTablet = Map[CardType, BrowserWidth](
    (MediaList, 140.px),
    (Fluid, 140.px),
    (Standard, 160.px),
    (Third, 220.px),
    (Half, 340.px),
    (ThreeQuarters, 340.px),
    (ThreeQuartersRight, 340.px),
    (ThreeQuartersTall, 520.px),
    (FullMedia50, 350.px),
    (FullMedia75, 520.px),
    (FullMedia100, 700.px),
  )

  private val CutOutTablet = Map[CardType, BrowserWidth](
    (MediaList, 115.px),
    (Standard, 216.px),
    (Third, 187.px),
    (Half, 331.px),
    (ThreeQuarters, 331.px),
    (ThreeQuartersRight, 331.px),
    (ThreeQuartersTall, 331.px),
    (FullMedia50, 331.px),
    (FullMedia75, 331.px),
    (FullMedia100, 331.px),
  )

  private val MediaDesktop = Map[CardType, BrowserWidth](
    (MediaList, 140.px),
    (Fluid, 188.px),
    (Standard, 220.px),
    (Third, 300.px),
    (Half, 460.px),
    (ThreeQuarters, 460.px),
    (ThreeQuartersRight, 460.px),
    (ThreeQuartersTall, 700.px),
    (FullMedia50, 470.px),
    (FullMedia75, 700.px),
    (FullMedia100, 940.px),
  )

  private val CutOutDesktop = Map[CardType, BrowserWidth](
    (MediaList, 115.px),
    (Standard, 216.px),
    (Third, 216.px),
    (Half, 331.px),
    (ThreeQuarters, 389.px),
    (ThreeQuartersRight, 389.px),
    (ThreeQuartersTall, 331.px),
    (FullMedia50, 331.px),
    (FullMedia75, 331.px),
    (FullMedia100, 331.px),
  )

  private val SquareImageFronts = Map[CardType, BrowserWidth](
    (Standard, 368.px),
  )

  def mediaFromItemClasses(itemClasses: ItemClasses): WidthsByBreakpoint = {
    val desktopClass = itemClasses.desktop.getOrElse(itemClasses.tablet)

    WidthsByBreakpoint(
      mobile = MediaMobile.get(itemClasses.mobile),
      tablet = MediaTablet.get(itemClasses.tablet),
      desktop = MediaDesktop.get(desktopClass),
    )
  }

  def squareFront(): WidthsByBreakpoint = {
    WidthsByBreakpoint(
      mobile = SquareImageFronts.get(Standard),
      tablet = SquareImageFronts.get(Standard),
      desktop = SquareImageFronts.get(Standard),
    )
  }

  def cutOutFromItemClasses(itemClasses: ItemClasses): WidthsByBreakpoint = {
    val desktopClass = itemClasses.desktop.getOrElse(itemClasses.tablet)

    WidthsByBreakpoint(
      mobile = CutOutMobile.get(itemClasses.mobile),
      tablet = CutOutTablet.get(itemClasses.tablet),
      desktop = CutOutDesktop.get(desktopClass),
    )
  }
}
