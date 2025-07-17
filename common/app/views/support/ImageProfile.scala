package views.support

import java.net.{URI, URISyntaxException}
import java.util.Base64

import common.GuLogging
import conf.switches.Switches.{ImageServerSwitch}
import conf.{Configuration}
import layout.{BreakpointWidth, WidthsByBreakpoint}
import model._
import org.apache.commons.lang3.math.Fraction
import play.api.libs.json.{Json, Writes}

import Function.const

/** ElementProfile is configuration for displaying an image, and is used to generate custom URLs (with parameters) for
  * calls to our Fastly image service.
  */
sealed trait ElementProfile {

  def width: Option[Int]
  def height: Option[Int]
  def hidpi: Boolean
  def compression: Int
  def isPng: Boolean
  def autoFormat: Boolean

  private def toSrc(maybeAsset: Option[ImageAsset]): Option[String] =
    maybeAsset.flatMap(_.url).map(ImgSrc(_, this))

  def bestFor(image: ImageMedia): Option[ImageAsset] = {
    if (!ImageServerSwitch.isSwitchedOn) {
      val sortedCrops = image.imageCrops.sortBy(-_.width)
      width
        .flatMap { desiredWidth =>
          sortedCrops.find(_.width >= desiredWidth)
        }
        .orElse(image.largestImage)
    } else image.largestImage
  }
  def bestSrcFor(image: ImageMedia): Option[String] = toSrc(bestFor(image))

  def captionFor(image: ImageMedia): Option[String] =
    bestFor(image).flatMap(_.caption)

  def altTextFor(image: ImageMedia): Option[String] =
    bestFor(image).flatMap(_.altText)

  // NOTE - if you modify this in any way there is a decent chance that you decache all our images :(
  val qualityparam: String = if (hidpi) { "quality=45" }
  else { "quality=85" }
  val autoParam: String = if (autoFormat) "auto=format" else ""
  val fitParam = "fit=max"
  val dprParam: String = if (hidpi) {
    if (isPng) {
      "dpr=1.3"
    } else {
      "dpr=2"
    }
  } else { "" }
  val heightParam: String = height.map(pixels => s"height=$pixels").getOrElse("")
  val widthParam: String = width.map(pixels => s"width=$pixels").getOrElse("")
  val sharpenParam: String = ""

  def resizeString: String = {
    val params = Seq(widthParam, heightParam, qualityparam, autoParam, fitParam, dprParam, sharpenParam)
      .filter(_.nonEmpty)
      .mkString("&")
    s"?$params"
  }

}

/** ImageProfile is an ElementProfile that provides sensible defaults. It is used as the base class for lots of more
  * specific profiles.
  */
case class ImageProfile(
    override val width: Option[Int] = None,
    override val height: Option[Int] = None,
    override val hidpi: Boolean = false,
    override val compression: Int = 95,
    override val isPng: Boolean = false,
    override val autoFormat: Boolean = true,
) extends ElementProfile

object VideoProfile {
  lazy val ratioHD = Fraction.getFraction(16, 9)
}

case class VideoProfile(
    override val width: Some[Int],
    override val height: Option[Int] = None,
    override val hidpi: Boolean = false,
    override val compression: Int = 95,
    override val isPng: Boolean = false,
    override val autoFormat: Boolean = true,
) extends ElementProfile {}

/** SrcSet relates to the HTML `srcSet` attribute but only represents a single image source-width combo. For information
  * on the HTML attribute, see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset.
  */
case class SrcSet(src: String, width: Int) {
  def asSrcSetString: String = {
    s"$src ${width}w"
  }

}
object SrcSet {
  implicit val srcSetWrites: Writes[SrcSet] = Json.writes[SrcSet]

  def asSrcSetString(srcSets: Seq[SrcSet]): String = {
    srcSets.map(_.asSrcSetString).mkString(", ")
  }
}

// Configuration of our different image profiles
object Contributor extends ImageProfile(width = Some(140), height = Some(140))
object RichLinkContributor extends ImageProfile(width = Some(173))
object Item120 extends ImageProfile(width = Some(120))
object Item140 extends ImageProfile(width = Some(140))
object Item300 extends ImageProfile(width = Some(300))
object Item460 extends ImageProfile(width = Some(460))
object Item620 extends ImageProfile(width = Some(620))
object Item640 extends ImageProfile(width = Some(640))
object Item700 extends ImageProfile(width = Some(700))
object Item1200 extends ImageProfile(width = Some(1200))
object Video640 extends VideoProfile(width = Some(640))
object Video700 extends VideoProfile(width = Some(700))
object Video1280 extends VideoProfile(width = Some(1280))
object GoogleStructuredData extends ImageProfile(width = Some(300), height = Some(300)) // 1:1

// Used for AMP image structured data - see
// https://developers.google.com/search/docs/data-types/article#article_types
// and the image advice.
object OneByOne extends ImageProfile(width = Some(1200), height = Some(1200)) {
  override val fitParam: String = "fit=crop"
}
object FourByThree extends ImageProfile(width = Some(1200), height = Some(900)) {
  override val fitParam: String = "fit=crop"
}

class ShareImage(
    overlayUrlParam: String,
    shouldIncludeOverlay: Boolean,
    shouldUpscale: Boolean = false,
) extends ImageProfile(width = Some(1200)) {

  override val heightParam = "height=630"
  override val fitParam = "fit=crop"
  val overlayAlignParam = "overlay-align=bottom%2Cleft"
  val overlayWidthParam = "overlay-width=100p"

  // If we only use "fit=crop", then fastly will crop to the centre of the image.
  // This often means that we lose the tops of people's faces which looks bad,
  // especially since the switch from 5:4 to 5:3 images means that they tend to be
  // even taller than the social share image's ratios.
  // Instead, tell fastly to crop to 40:21 (equivalent to 1200:630), anchoring to the top
  // vertically, but the centre horizontally, BEFORE it resizes and fits the image to 1200x630.
  val precropParam = "precrop=40:21,offset-x50,offset-y0"

  override def resizeString: String = {
    if (shouldIncludeOverlay) {
      val params = Seq(
        widthParam,
        heightParam,
        qualityparam,
        autoParam,
        fitParam,
        precropParam,
        dprParam,
        overlayAlignParam,
        overlayWidthParam,
        overlayUrlParam,
      ).filter(_.nonEmpty).mkString("&")

      if (shouldUpscale) s"?$params&enable=upscale" else s"?$params"
    } else {
      super.resizeString
    }
  }
}

sealed trait ShareImageCategory
case object GuardianDefault extends ShareImageCategory
case object ObserverDefault extends ShareImageCategory
case class CommentObserverOldContent(publicationYear: Int) extends ShareImageCategory
case class CommentGuardianOldContent(publicationYear: Int) extends ShareImageCategory
case object ObserverOpinion extends ShareImageCategory
case object GuardianOpinion extends ShareImageCategory
case object Live extends ShareImageCategory
case class ObserverOldContent(publicationYear: Int) extends ShareImageCategory
case class GuardianOldContent(publicationYear: Int) extends ShareImageCategory
case class ObserverStarRating(rating: Int) extends ShareImageCategory
case class GuardianStarRating(rating: Int) extends ShareImageCategory
case object Paid extends ShareImageCategory

trait OverlayBase64 {
  def overlayUrlBase64(overlay: String): String =
    Base64.getUrlEncoder.encodeToString(s"/img/static/overlays/$overlay".getBytes).replace("=", "")
}

object OpenGraphImage extends OverlayBase64 {
  def forCategory(
      category: ShareImageCategory,
      shouldIncludeOverlay: Boolean,
      shouldUpscale: Boolean = false,
  ): ElementProfile = {
    category match {
      case GuardianDefault =>
        new ShareImage(s"overlay-base64=${overlayUrlBase64("tg-default.png")}", shouldIncludeOverlay, shouldUpscale)
      case ObserverDefault =>
        new ShareImage(s"overlay-base64=${overlayUrlBase64("to-default.png")}", shouldIncludeOverlay, shouldUpscale)
      case ObserverOpinion =>
        new ShareImage(s"overlay-base64=${overlayUrlBase64("to-opinions.png")}", shouldIncludeOverlay, shouldUpscale)
      case GuardianOpinion =>
        new ShareImage(s"overlay-base64=${overlayUrlBase64("tg-opinions.png")}", shouldIncludeOverlay, shouldUpscale)
      case Live =>
        new ShareImage(s"overlay-base64=${overlayUrlBase64("tg-live.png")}", shouldIncludeOverlay, shouldUpscale)
      case CommentObserverOldContent(year) => contentAgeNoticeCommentObserver(year, shouldIncludeOverlay, shouldUpscale)
      case CommentGuardianOldContent(year) => contentAgeNoticeComment(year, shouldIncludeOverlay, shouldUpscale)
      case ObserverOldContent(year)        => contentAgeNoticeObserver(year, shouldIncludeOverlay, shouldUpscale)
      case GuardianOldContent(year)        => contentAgeNotice(year, shouldIncludeOverlay, shouldUpscale)
      case ObserverStarRating(rating)      => starRatingObserver(rating, shouldIncludeOverlay, shouldUpscale)
      case GuardianStarRating(rating)      => starRating(rating, shouldIncludeOverlay, shouldUpscale)
      case Paid                            => Item700
    }
  }

  private[this] def starRating(
      rating: Int,
      shouldIncludeOverlay: Boolean,
      shouldUpscale: Boolean = false,
  ): ShareImage = {
    val image = rating match {
      case x if 0 to 5 contains x => s"overlay-base64=${overlayUrlBase64(s"tg-review-$x.png")}"
      case _                      => s"overlay-base64=${overlayUrlBase64("tg-default.png")}"
    }
    new ShareImage(image, shouldIncludeOverlay, shouldUpscale)
  }

  private[this] def starRatingObserver(
      rating: Int,
      shouldIncludeOverlay: Boolean,
      shouldUpscale: Boolean = false,
  ): ShareImage = {
    val image = rating match {
      case x if 0 to 5 contains x => s"overlay-base64=${overlayUrlBase64(s"to-review-$x.png")}"
      case _                      => s"overlay-base64=${overlayUrlBase64("to-default.png")}"
    }
    new ShareImage(image, shouldIncludeOverlay, shouldUpscale)
  }

  private[this] def getContentAgeFileName(prefix: String, publicationYear: Int): String = {
    // WARNING: we have only produced these content age images up to the year 2025
    if (publicationYear < 2025) {
      s"${prefix}-age-${publicationYear}.png"
    } else {
      s"${prefix}-default.png"
    }
  }

  private[this] def contentAgeNotice(
      publicationYear: Int,
      shouldIncludeOverlay: Boolean,
      shouldUpscale: Boolean = false,
  ): ShareImage = {
    val image = s"overlay-base64=${overlayUrlBase64(getContentAgeFileName("tg", publicationYear))}"
    new ShareImage(image, shouldIncludeOverlay, shouldUpscale)
  }

  private[this] def contentAgeNoticeObserver(
      publicationYear: Int,
      shouldIncludeOverlay: Boolean,
      shouldUpscale: Boolean,
  ): ShareImage = {
    val image = s"overlay-base64=${overlayUrlBase64(getContentAgeFileName("to", publicationYear))}"
    new ShareImage(image, shouldIncludeOverlay, shouldUpscale)
  }

  private[this] def contentAgeNoticeComment(
      publicationYear: Int,
      shouldIncludeOverlay: Boolean,
      shouldUpscale: Boolean = false,
  ): ShareImage = {
    val image = s"overlay-base64=${overlayUrlBase64(getContentAgeFileName("tg-opinions", publicationYear))}"
    new ShareImage(image, shouldIncludeOverlay, shouldUpscale)
  }

  private[this] def contentAgeNoticeCommentObserver(
      publicationYear: Int,
      shouldIncludeOverlay: Boolean,
      shouldUpscale: Boolean,
  ): ShareImage = {
    val image = s"overlay-base64=${overlayUrlBase64(getContentAgeFileName("to-opinions", publicationYear))}"
    new ShareImage(image, shouldIncludeOverlay, shouldUpscale)
  }
}

object EmailImage extends ImageProfile(width = Some(EmailImageParams.articleFullWidth), autoFormat = false) {
  override val qualityparam: String = EmailImageParams.qualityParam
  override val sharpenParam: String = EmailImageParams.sharpenParam
  override val dprParam: String = EmailImageParams.dprParam
  val knownWidth: Int = width.get
}

object EmailVideoImage
    extends ImageProfile(width = Some(EmailImageParams.videoFullWidth), autoFormat = false)
    with OverlayBase64 {
  override val qualityparam: String = EmailImage.qualityparam
  override val dprParam: String = EmailImageParams.dprParam
  val overlayAlignParam = "overlay-align=bottom,left"
  val overlayUrlParam = s"overlay-base64=${overlayUrlBase64("playx2.png")}"
  val knownWidth: Int = width.get

  override def resizeString: String = {
    val params = Seq(widthParam, heightParam, qualityparam, autoParam, dprParam, overlayAlignParam, overlayUrlParam)
      .filter(_.nonEmpty)
      .mkString("&")
    s"?$params"
  }
}

object EmailImageParams {
  val qualityParam: String = "quality=45"
  val sharpenParam: String = "sharpen=a0.8,r1,t1"
  val fullWidth: Int = 500
  val articleFullWidth: Int = 580
  val videoFullWidth: Int = 560
  val dprParam: String = "dpr=2"
}

object FrontEmailImage {
  def apply(customWidth: Int): FrontEmailImage = new FrontEmailImage(customWidth)
}
class FrontEmailImage(customWidth: Int) extends ImageProfile(Some(customWidth), autoFormat = false) {
  override val dprParam: String = EmailImageParams.dprParam
  override val qualityparam: String = EmailImageParams.qualityParam
  override val sharpenParam: String = EmailImageParams.sharpenParam
}

// The imager/images.js base image.
object SeoOptimisedContentImage extends ImageProfile(width = Some(460))

// Just degrade the image quality without adjusting the width/height
object Naked extends ImageProfile(None, None)

object ImgSrc extends GuLogging with implicits.Strings {

  private val imageServiceHost: String = Configuration.images.host

  private lazy val hostPrefixMapping: Map[String, String] = Map(
    "static.guim.co.uk" -> "static",
    "static-secure.guim.co.uk" -> "static",
    "media.guim.co.uk" -> "media",
    "uploads.guim.co.uk" -> "uploads",
  )

  private val supportedImages = Set(".jpg", ".jpeg", ".png")

  def apply(
      url: String,
      imageType: ElementProfile,
  ): String = {
    try {
      val uri = new URI(url.trim.encodeURI)
      val isSupportedImage = supportedImages.exists(extension => uri.getPath.toLowerCase.endsWith(extension))

      hostPrefixMapping
        .get(uri.getHost)
        .filter(const(ImageServerSwitch.isSwitchedOn))
        .filter(const(isSupportedImage))
        .map { hostPrefix =>
          val signedPath = ImageUrlSigner.sign(s"${uri.getRawPath}${imageType.resizeString}")
          s"$imageServiceHost/img/$hostPrefix$signedPath"
        }
        .getOrElse(url)
    } catch {
      case error: URISyntaxException =>
        log.error("Unable to decode image url", error)
        url
    }
  }

  def srcset(imageContainer: ImageMedia, widths: WidthsByBreakpoint): String = {
    widths.profiles.map { profile =>
      srcsetForProfile(profile, imageContainer, hidpi = false).asSrcSetString
    } mkString ", "
  }

  def srcsetForBreakpoint(
      breakpointWidth: BreakpointWidth,
      breakpointWidths: Seq[BreakpointWidth],
      maybePath: Option[String] = None,
      maybeImageMedia: Option[ImageMedia] = None,
      hidpi: Boolean = false,
  ): Seq[SrcSet] = {
    val isPng = maybePath.exists(path => path.toLowerCase.endsWith("png"))
    breakpointWidth
      .toPixels(breakpointWidths)
      .map(browserWidth => ImageProfile(width = Some(browserWidth), hidpi = hidpi, isPng = isPng))
      .flatMap { profile =>
        {
          maybePath
            .map(url => srcsetForProfile(profile, url, hidpi))
            .orElse(maybeImageMedia.map(imageContainer => srcsetForProfile(profile, imageContainer, hidpi)))
        }
      }
  }

  def srcsetForProfile(
      profile: ImageProfile,
      imageContainer: ImageMedia,
      hidpi: Boolean,
  ): SrcSet =
    SrcSet(profile.bestSrcFor(imageContainer).getOrElse("unknown"), profile.width.get * (if (hidpi) 2 else 1))

  // profile.width really shouldn't be None, but if it is use the inline image desktop default width
  def srcsetForProfile(profile: ImageProfile, path: String, hidpi: Boolean): SrcSet =
    SrcSet(ImgSrc(path, profile), profile.width.getOrElse(620) * (if (hidpi) 2 else 1))

  def getFallbackUrl(ImageElement: ImageMedia): Option[String] =
    Item300.bestSrcFor(ImageElement)

  def getAmpImageUrl(ImageElement: ImageMedia): Option[String] =
    Item620.bestSrcFor(ImageElement)

  def getFallbackAsset(ImageElement: ImageMedia): Option[ImageAsset] =
    Item300.bestFor(ImageElement)
}

object SeoThumbnail {
  def apply(page: Page): Option[String] =
    page match {
      case content: ContentPage =>
        content.item.elements.thumbnail.flatMap(thumbnail => Item620.bestSrcFor(thumbnail.images))
      case _ => None
    }
}
