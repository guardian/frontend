package layout

case class BreakpointWidth(breakpoint: Breakpoint, width: BrowserWidth) {
  private val MaximumMobileImageWidth = 620
  private val SourcesToEmitOnMobile = 3

  def toPixels: (Seq[BreakpointWidth]) => Seq[Int] =
    (breakpointWidths: Seq[BreakpointWidth]) =>
      this match {
        case BreakpointWidth(_, PixelWidth(pixels)) =>
          Seq(pixels)
        case BreakpointWidth(Mobile, _: PercentageWidth | _: ViewportWidth) =>
          // Percentage and viewport widths are not explicitly associated with any pixel widths that could be used with a srcset.
          // So we create a series of profiles by combining usable widths in the class with predefined sensible widths.
          val pixelWidths = breakpointWidths.collect { case BreakpointWidth(_, width: PixelWidth) => width.get }
          val widths: Seq[Int] = pixelWidths.dropWhile(_ > MaximumMobileImageWidth).take(SourcesToEmitOnMobile)
          widths ++ FaciaWidths.ExtraPixelWidthsForMediaMobile.map(_.get)
        case _ => Seq.empty
      }
}
