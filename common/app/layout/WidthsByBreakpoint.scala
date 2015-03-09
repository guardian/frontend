package layout

import cards._
import BrowserWidth._
import views.support.Profile

object FaciaWidths {
  private val MediaMobile = Map[CardType, BrowserWidth](
    (MediaList, 127.px),
    (Standard, 100.perc)
  )

  private val CutOutMobile = Map[CardType, BrowserWidth](
    (MediaList, 115.px),
    (Standard, 130.px)
  )

  private val MediaTablet = Map[CardType, BrowserWidth](
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

  private val CutOutTablet = Map[CardType, BrowserWidth](
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

  private val MediaDesktop = Map[CardType, BrowserWidth](
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

  private val CutOutDesktop = Map[CardType, BrowserWidth](
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

object ContentWidths {

  sealed class ContentHinting (
    val mainContentWidths: WidthsByBreakpoint,
    val bodyContentWidths: WidthsByBreakpoint,
    val className: Option[String]
  )

  private val unused = WidthsByBreakpoint(None, None, None, None, None, None, None)

  object Inline     extends ContentHinting (MainMedia.Inline,     BodyMedia.Inline,     None)
  object Supporting extends ContentHinting (unused,               BodyMedia.Supporting, Some("element--supporting"))
  object Showcase   extends ContentHinting (MainMedia.Showcase,   BodyMedia.Showcase,   Some("element--showcase"))
  object Thumbnail  extends ContentHinting (unused,               BodyMedia.Thumbnail,  Some("element--thumbnail"))

  sealed trait ContentRelation

  object BodyMedia extends ContentRelation {
    val Inline = WidthsByBreakpoint(
      mobile =          Some(445.px),
      mobileLandscape = Some(605.px),
      phablet =         Some(620.px)) // tablet, desktop, leftCol and wide are also 620px

    val Supporting = WidthsByBreakpoint(
      mobile =          Some(445.px),
      mobileLandscape = Some(605.px),
      phablet =         Some(620.px), // tablet is also 620px
      desktop =         Some(300.px), // leftCol is also 300px
      wide =            Some(380.px))

    val Showcase = WidthsByBreakpoint(
      mobile =          Some(445.px),
      mobileLandscape = Some(605.px),
      phablet =         Some(620.px), // tablet and desktop are also 620px
      leftCol =         Some(780.px),
      wide =            Some(860.px))

    val Thumbnail = WidthsByBreakpoint(
      mobile =          Some(120.px), // mobileLandscape and tablet are also 120px
      tablet =          Some(140.px)) // desktop, leftCol and wide are also 140px
  }

  object MainMedia extends ContentRelation {
    val Inline = WidthsByBreakpoint(
      mobile =          Some(465.px),
      mobileLandscape = Some(645.px),
      phablet =         Some(620.px),
      tablet =          Some(700.px),
      desktop =         Some(620.px)) // leftCol and wide are also 620px

    val Showcase = WidthsByBreakpoint(
      mobile =          Some(465.px),
      mobileLandscape = Some(645.px),
      phablet =         Some(620.px),
      tablet =          Some(700.px),
      desktop =         Some(620.px),
      leftCol =         Some(780.px),
      wide =            Some(860.px))

    val FeatureShowcase = WidthsByBreakpoint(
      mobile =          Some(465.px),
      mobileLandscape = Some(645.px),
      phablet =         Some(725.px),
      tablet =          Some(965.px),
      desktop =         Some(1125.px),
      leftCol =         Some(1140.px),
      wide =            Some(1300.px))
  }

  object PictureMedia {
    // PictureMedia does not support hinting/weighting, so does not extend ContentRelation.
    val Inline = WidthsByBreakpoint(
      mobile =          Some(465.px),
      mobileLandscape = Some(645.px),
      phablet =         Some(685.px),
      tablet =          Some(700.px),
      desktop =         Some(940.px)) // leftCol and wide are also 940px
  }

  object GalleryMedia {
    val Inline = WidthsByBreakpoint(
      mobile          = Some(445.px),
      mobileLandscape = Some(610.px),
      phablet =         Some(620.px),
      tablet =          Some(700.px)) // desktop, leftCol, and wide are also 700px

    val Lightbox = WidthsByBreakpoint(
      mobile =          Some(465.px),
      mobileLandscape = Some(645.px),
      phablet =         Some(725.px),
      tablet =          Some(965.px),
      desktop =         Some(1065.px),
      leftCol =         Some(1225.px)) // leftCol is also 1225px
  }

  def getWidthsFromContentElement(hinting: ContentHinting, relation: ContentRelation): WidthsByBreakpoint = {
    relation match {
      case MainMedia => hinting.mainContentWidths
      case _ => hinting.bodyContentWidths }
  }
}

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

  private val breakpoints = allBreakpoints zip allWidths map BreakpointWidth.tupled

  private val MaximumMobileImageWidth = 620
  private val SourcesToEmitOnMobile = 3

  def sizes: String = breakpoints collect {
    case BreakpointWidth(Mobile, Some(imageWidth)) =>
      imageWidth.toString

    case BreakpointWidth(breakpoint, Some(imageWidth)) =>
      s"(min-width: ${breakpoint.minWidth.get}px) $imageWidth"
  } mkString ", "

  val maxWidth: Int = (allWidths collect {
    case Some(PixelWidth(pixels)) => pixels
    case Some(PercentageWidth(_)) => MaximumMobileImageWidth
    case None => 0
  }).max

  def sources: Seq[Source] = breakpoints flatMap {
    case BreakpointWidth(breakpoint, Some(PixelWidth(pixels))) =>
      Seq(Source(breakpoint.minWidth, pixels))

    case BreakpointWidth(Mobile, Some(PercentageWidth(percentage))) =>
      val widths = profiles.flatMap(_.width).dropWhile(_ > MaximumMobileImageWidth).take(SourcesToEmitOnMobile)
      val minWidths = widths.map(Some(_)).drop(1) ++ Seq(None)

      (widths zip minWidths) map { case (width, minWidth) =>
        Source(minWidth, width)
      }

    case _ => Seq.empty
  }

  val profiles: Seq[Profile] = allWidths
      .flatten
      .map(_.get)
      .distinct
      .map(browserWidth => Profile(width = Some(browserWidth)))
}

case class Source(minWidth: Option[Int], pixelWidth: Int)

case class BreakpointWidth(breakpoint: Breakpoint, width: Option[BrowserWidth])
