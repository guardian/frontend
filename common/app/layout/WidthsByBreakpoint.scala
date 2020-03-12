package layout

import views.support.ImageProfile

case class WidthsByBreakpoint(
  mobile:          Option[BrowserWidth] = None,
  mobileLandscape: Option[BrowserWidth] = None,
  phablet:         Option[BrowserWidth] = None,
  tablet:          Option[BrowserWidth] = None,
  desktop:         Option[BrowserWidth] = None,
  leftCol:         Option[BrowserWidth] = None,
  wide:            Option[BrowserWidth] = None
) {
  private val allBreakpoints: List[Breakpoint] = List(Wide, LeftCol, Desktop, Tablet, Phablet, MobileLandscape, Mobile)
  private val allWidths: List[Option[BrowserWidth]] = List(wide, leftCol, desktop, tablet, phablet, mobileLandscape, mobile)
  val breakpoints: Seq[BreakpointWidth] = allBreakpoints zip allWidths collect {
    case (breakpoint, Some(width)) => BreakpointWidth(breakpoint, width)
  }

  def sizes: String = breakpoints map {
    case BreakpointWidth(Mobile, imageWidth) =>
      imageWidth.toString

    case BreakpointWidth(breakpoint, imageWidth) =>
      s"(min-width: ${breakpoint.minWidth.get}px) $imageWidth"
  } mkString ", "

  def profiles: Seq[ImageProfile] = (breakpoints flatMap(_.toPixels(breakpoints)))
    .distinct
    .map((browserWidth: Int) => ImageProfile(width = Some(browserWidth)))
}
