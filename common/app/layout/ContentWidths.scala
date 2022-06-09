package layout

import BrowserWidth._

object ContentWidths {

  sealed class ContentHinting(
      val className: Option[String],
  )

  val unused = WidthsByBreakpoint(None, None, None, None, None, None, None)

  object Inline extends ContentHinting(None)
  object Supporting extends ContentHinting(Some("element--supporting"))
  object Showcase extends ContentHinting(Some("element--showcase"))
  object Thumbnail extends ContentHinting(Some("element--thumbnail"))
  object Immersive extends ContentHinting(Some("element--immersive"))
  object Halfwidth extends ContentHinting(Some("element--halfWidth"))

  sealed trait ImageRoleWidthsByBreakpointMapping {
    def inline: WidthsByBreakpoint
    def supporting: WidthsByBreakpoint = unused
    def showcase: WidthsByBreakpoint = unused
    def thumbnail: WidthsByBreakpoint = unused
    def immersive: WidthsByBreakpoint = unused
    def halfwidth: WidthsByBreakpoint = unused

    def all: Map[String, WidthsByBreakpoint] =
      Map(
        "inline" -> inline,
        "supporting" -> supporting,
        "showcase" -> showcase,
        "thumbnail" -> thumbnail,
        "immersive" -> immersive,
        "halfwidth" -> halfwidth,
      )
  }

  object BodyMedia extends ImageRoleWidthsByBreakpointMapping {
    override val inline = WidthsByBreakpoint(
      mobile = Some(445.px),
      mobileLandscape = Some(605.px),
      phablet = Some(620.px),
    ) // tablet, desktop, leftCol and wide are also 620px

    override val supporting = WidthsByBreakpoint(
      mobile = Some(445.px),
      mobileLandscape = Some(605.px),
      phablet = Some(620.px), // tablet is also 620px
      desktop = Some(300.px), // leftCol is also 300px
      wide = Some(380.px),
    )

    override val showcase = WidthsByBreakpoint(
      mobile = Some(445.px),
      mobileLandscape = Some(605.px),
      phablet = Some(620.px), // tablet and desktop are also 620px
      leftCol = Some(780.px),
      wide = Some(860.px),
    )

    override val thumbnail = WidthsByBreakpoint(
      mobile = Some(120.px), // mobileLandscape and tablet are also 120px
      tablet = Some(140.px),
    ) // desktop, leftCol and wide are also 140px

    override val immersive = WidthsByBreakpoint(
      mobile = Some(480.px),
      mobileLandscape = Some(660.px),
      phablet = Some(740.px),
      tablet = Some(980.px),
      desktop = Some(1140.px),
      leftCol = Some(1300.px),
      wide = Some(1900.px),
    )

    override val halfwidth = BodyMedia.inline
  }

  object MainMedia extends ImageRoleWidthsByBreakpointMapping {
    override val inline = WidthsByBreakpoint(
      mobile = Some(465.px),
      mobileLandscape = Some(645.px),
      phablet = Some(620.px),
      tablet = Some(700.px),
      desktop = Some(620.px),
    ) // leftCol and wide are also 620px

    override val showcase = WidthsByBreakpoint(
      mobile = Some(465.px),
      mobileLandscape = Some(645.px),
      phablet = Some(660.px),
      tablet = Some(700.px),
      desktop = Some(700.px),
      leftCol = Some(940.px),
      wide = Some(1020.px),
    )

    /**
      * main image is showcase on a feature article, e.g.
      * http://www.theguardian.com/politics/2015/may/02/nicola-sturgeon-im-the-boss-now
      */
    val featureShowcase = WidthsByBreakpoint(
      mobile = Some(465.px),
      mobileLandscape = Some(645.px),
      phablet = Some(725.px),
      tablet = Some(965.px),
      desktop = Some(1125.px),
      leftCol = Some(1140.px),
      wide = Some(1300.px),
    )

    /**
      * Used when the main image is an immersive image
      * like on galleries and immersive articles
      */
    override val immersive = WidthsByBreakpoint(
      mobile = Some(480.px),
      mobileLandscape = Some(660.px),
      phablet = Some(740.px),
      tablet = Some(980.px),
      desktop = Some(1140.px),
      leftCol = Some(1300.px),
      wide = Some(1900.px),
    )
  }

  /**
    * Immersive media is all the media within immersive content body
    */
  object ImmersiveMedia extends ImageRoleWidthsByBreakpointMapping {
    override val inline = BodyMedia.inline
    override val supporting = BodyMedia.supporting
    override val thumbnail = BodyMedia.thumbnail
    override val halfwidth = BodyMedia.inline

    override val immersive = WidthsByBreakpoint(
      mobile = Some(465.px),
      mobileLandscape = Some(645.px),
      phablet = Some(725.px),
      tablet = Some(965.px),
      desktop = Some(1125.px),
      leftCol = Some(1140.px),
      wide = Some(1300.px),
    )

    override val showcase = WidthsByBreakpoint(
      mobile = Some(445.px),
      mobileLandscape = Some(605.px),
      phablet = Some(620.px), // tablet is also 620px
      desktop = Some(640.px),
      leftCol = Some(800.px),
      wide = Some(880.px),
    )
  }

  object MinuteMedia extends ImageRoleWidthsByBreakpointMapping {
    override val inline = WidthsByBreakpoint(
      // Inline images, on mobile, in minute articles have a large width
      // to retain a high resolution when cropping using `object-fit: cover;`
      mobile = Some(1000.px),
      tablet = Some(300.px),
      desktop = Some(380.px),
      leftCol = Some(460.px),
      wide = Some(540.px),
    )

    override val thumbnail = WidthsByBreakpoint(mobile = Some(95.vw))
  }

  object LiveBlogMedia extends ImageRoleWidthsByBreakpointMapping {
    override val inline = WidthsByBreakpoint(
      mobile = Some(465.px),
      mobileLandscape = Some(645.px),
      phablet = Some(620.px),
      tablet = Some(700.px),
      desktop = Some(620.px),
      // This is like `MainMedia.Inline`, but with a different `leftCol` and `wide`.
      leftCol = Some(780.px),
      wide = Some(620.px),
    )
  }

  object ImageContentMedia {
    // ImageContentMedia does not support hinting/weighting, so does not extend ContentRelation.
    val inline = WidthsByBreakpoint(
      mobile = Some(465.px),
      mobileLandscape = Some(645.px),
      phablet = Some(685.px),
      tablet = Some(700.px),
      desktop = Some(940.px),
    ) // leftCol and wide are also 940px
  }

  object GalleryMedia {
    val inline = WidthsByBreakpoint(
      mobile = Some(480.px),
      mobileLandscape = Some(660.px),
      phablet = Some(700.px),
      tablet = Some(700.px), // TODO: Change to 480 when new galleries is merged
      desktop = Some(720.px),
      leftCol = Some(880.px),
      wide = Some(1010.px),
    )

    val lightbox = WidthsByBreakpoint(
      mobile = Some(465.px),
      mobileLandscape = Some(645.px),
      phablet = Some(725.px),
      tablet = Some(965.px),
      desktop = Some(1065.px),
      leftCol = Some(1225.px),
      wide = Some(1920.px),
    )
  }

  def getWidthsFromContentElement(
      hinting: ContentHinting,
      relation: ImageRoleWidthsByBreakpointMapping,
  ): WidthsByBreakpoint = {
    hinting match {
      case Inline     => relation.inline
      case Supporting => relation.supporting
      case Showcase   => relation.showcase
      case Thumbnail  => relation.thumbnail
      case Immersive  => relation.immersive
      case Halfwidth  => relation.halfwidth
      case _          => unused
    }
  }
}
