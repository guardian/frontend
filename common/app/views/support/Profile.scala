package views.support

import java.net.{URI, URISyntaxException}
import java.util.Base64

import common.Logging
import conf.switches.Switches.{FacebookShareImageLogoOverlay, ImageServerSwitch, TwitterShareImageLogoOverlay}
import conf.{Configuration, Static}
import layout.{BreakpointWidth, WidthsByBreakpoint}
import model._
import org.apache.commons.math3.fraction.Fraction
import org.apache.commons.math3.util.Precision
import common.Environment.{app, awsRegion, stage}

import Function.const

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
    if(!ImageServerSwitch.isSwitchedOn) {
      val sortedCrops = image.imageCrops.sortBy(-_.width)
      width.flatMap{ desiredWidth =>
        sortedCrops.find(_.width >= desiredWidth)
      }.orElse(image.largestImage)
    }
    else image.largestImage
  }
  def bestSrcFor(image: ImageMedia): Option[String] = toSrc(bestFor(image))

  def captionFor(image: ImageMedia): Option[String] =
    bestFor(image).flatMap(_.caption)

  def altTextFor(image: ImageMedia): Option[String] =
    bestFor(image).flatMap(_.altText)

  // NOTE - if you modify this in any way there is a decent chance that you decache all our images :(
  val qualityparam = if (hidpi) {"quality=45"} else {"quality=85"}
  val autoParam = if (autoFormat) "auto=format" else ""
  val fitParam = "fit=max"
  val dprParam = if (hidpi) {
    if (isPng) {
      "dpr=1.3"
    } else {
      "dpr=2"
    }
  } else {""}
  val heightParam = height.map(pixels => s"height=$pixels").getOrElse("")
  val widthParam = width.map(pixels => s"width=$pixels").getOrElse("")

  def resizeString: String = {
    val params = Seq(widthParam, heightParam, qualityparam, autoParam, fitParam, dprParam).filter(_.nonEmpty).mkString("&")
    s"?$params"
  }

}

case class Profile(
  override val width: Option[Int] = None,
  override val height: Option[Int] = None,
  override val hidpi: Boolean = false,
  override val compression: Int = 95,
  override val isPng: Boolean = false,
  override val autoFormat: Boolean = true) extends ElementProfile

object VideoProfile {
  lazy val ratioHD = new Fraction(16,9)
}

case class VideoProfile(
  override val width: Some[Int],
  override val height: Some[Int],
  override val hidpi: Boolean = false,
  override val compression: Int = 95,
  override val isPng: Boolean = false,
  override val autoFormat: Boolean = true) extends ElementProfile {

  lazy val isRatioHD: Boolean = Precision.compareTo(VideoProfile.ratioHD.doubleValue, aspectRatio.doubleValue, 0.1d) == 0

  private lazy val aspectRatio: Fraction = new Fraction(width.get, height.get)
}

// Configuration of our different image profiles
object Contributor extends Profile(width = Some(140), height = Some(140))
object RichLinkContributor extends Profile(width = Some(173))
object Item120 extends Profile(width = Some(120))
object Item140 extends Profile(width = Some(140))
object Item300 extends Profile(width = Some(300))
object Item460 extends Profile(width = Some(460))
object Item620 extends Profile(width = Some(620))
object Item640 extends Profile(width = Some(640))
object Item700 extends Profile(width = Some(700))
object Item1200 extends Profile(width = Some(1200))
object Video640 extends VideoProfile(width = Some(640), height = Some(360)) // 16:9
object Video700 extends VideoProfile(width = Some(700), height = Some(394)) // 16:9
object Video1280 extends VideoProfile(width = Some(1280), height = Some(720)) // 16:9
object GoogleStructuredData extends Profile(width = Some(300), height = Some(300)) // 1:1

class ShareImage(overlayUrlParam: String, shouldIncludeOverlay: Boolean) extends Profile(width = Some(1200)) {
  override val heightParam = "height=630"
  override val fitParam = "fit=crop"
  val overlayAlignParam = "overlay-align=bottom%2Cleft"
  val overlayWidthParam = "overlay-width=100p"

  override def resizeString: String = {
    if(shouldIncludeOverlay) {
      val params = Seq(widthParam, heightParam, qualityparam, autoParam, fitParam, dprParam, overlayAlignParam, overlayWidthParam, overlayUrlParam).filter(_.nonEmpty).mkString("&")
      s"?$params"
    } else {
      super.resizeString
    }
  }
}

trait OverlayBase64 {
  def overlayUrlBase64(overlay: String): String =
    Base64.getUrlEncoder.encodeToString(s"img/static/overlays/$overlay".getBytes).replace("=", "")
}

object TwitterImage extends OverlayBase64 {
    val default = new ShareImage(s"overlay-base64=${overlayUrlBase64("tg-default.png")}", TwitterShareImageLogoOverlay.isSwitchedOn)
    val opinions = new ShareImage(s"overlay-base64=${overlayUrlBase64("tg-opinions.png")}", TwitterShareImageLogoOverlay.isSwitchedOn)
    val live = new ShareImage(s"overlay-base64=${overlayUrlBase64("tg-live.png")}", TwitterShareImageLogoOverlay.isSwitchedOn)
    def starRating(rating: Int): ShareImage = {
        val image = rating match {
            case 0 => s"overlay-base64=${overlayUrlBase64("tg-review-0.png")}"
            case 1 => s"overlay-base64=${overlayUrlBase64("tg-review-1.png")}"
            case 2 => s"overlay-base64=${overlayUrlBase64("tg-review-2.png")}"
            case 3 => s"overlay-base64=${overlayUrlBase64("tg-review-3.png")}"
            case 4 => s"overlay-base64=${overlayUrlBase64("tg-review-4.png")}"
            case 5 => s"overlay-base64=${overlayUrlBase64("tg-review-5.png")}"
            case _ => s"overlay-base64=${overlayUrlBase64("tg-default.png")}"
        }
        new ShareImage(image, TwitterShareImageLogoOverlay.isSwitchedOn)
    }
    def starRatingObserver(rating: Int): ShareImage = {
        val image = rating match {
            case 0 => s"overlay-base64=${overlayUrlBase64("to-review-0.png")}"
            case 1 => s"overlay-base64=${overlayUrlBase64("to-review-1.png")}"
            case 2 => s"overlay-base64=${overlayUrlBase64("to-review-2.png")}"
            case 3 => s"overlay-base64=${overlayUrlBase64("to-review-3.png")}"
            case 4 => s"overlay-base64=${overlayUrlBase64("to-review-4.png")}"
            case 5 => s"overlay-base64=${overlayUrlBase64("to-review-5.png")}"
            case _ => s"overlay-base64=${overlayUrlBase64("to-default.png")}"
        }
        new ShareImage(image, TwitterShareImageLogoOverlay.isSwitchedOn)
    }
    val defaultObserver = new ShareImage(s"overlay-base64=${overlayUrlBase64("to-default.png")}", TwitterShareImageLogoOverlay.isSwitchedOn)
    val opinionsObserver = new ShareImage(s"overlay-base64=${overlayUrlBase64("to-opinions.png")}", TwitterShareImageLogoOverlay.isSwitchedOn)
}

object FacebookOpenGraphImage extends OverlayBase64 {
    val default = new ShareImage(s"overlay-base64=${overlayUrlBase64("tg-default.png")}", FacebookShareImageLogoOverlay.isSwitchedOn)
    val opinions = new ShareImage(s"overlay-base64=${overlayUrlBase64("tg-opinions.png")}", FacebookShareImageLogoOverlay.isSwitchedOn)
    val live = new ShareImage(s"overlay-base64=${overlayUrlBase64("tg-live.png")}", FacebookShareImageLogoOverlay.isSwitchedOn)
    def starRating(rating: Int): ShareImage = {
        val image = rating match {
            case 0 => s"overlay-base64=${overlayUrlBase64("tg-review-0.png")}"
            case 1 => s"overlay-base64=${overlayUrlBase64("tg-review-1.png")}"
            case 2 => s"overlay-base64=${overlayUrlBase64("tg-review-2.png")}"
            case 3 => s"overlay-base64=${overlayUrlBase64("tg-review-3.png")}"
            case 4 => s"overlay-base64=${overlayUrlBase64("tg-review-4.png")}"
            case 5 => s"overlay-base64=${overlayUrlBase64("tg-review-5.png")}"
            case _ => s"overlay-base64=${overlayUrlBase64("tg-default.png")}"
        }
        new ShareImage(image, FacebookShareImageLogoOverlay.isSwitchedOn)
    }
    def starRatingObserver(rating: Int): ShareImage = {
        val image = rating match {
            case 0 => s"overlay-base64=${overlayUrlBase64("to-review-0.png")}"
            case 1 => s"overlay-base64=${overlayUrlBase64("to-review-1.png")}"
            case 2 => s"overlay-base64=${overlayUrlBase64("to-review-2.png")}"
            case 3 => s"overlay-base64=${overlayUrlBase64("to-review-3.png")}"
            case 4 => s"overlay-base64=${overlayUrlBase64("to-review-4.png")}"
            case 5 => s"overlay-base64=${overlayUrlBase64("to-review-5.png")}"
            case _ => s"overlay-base64=${overlayUrlBase64("to-default.png")}"
        }
        new ShareImage(image, FacebookShareImageLogoOverlay.isSwitchedOn)
    }
    val defaultObserver = new ShareImage(s"overlay-base64=${overlayUrlBase64("to-default.png")}", FacebookShareImageLogoOverlay.isSwitchedOn)
    val opinionsObserver = new ShareImage(s"overlay-base64=${overlayUrlBase64("to-opinions.png")}", FacebookShareImageLogoOverlay.isSwitchedOn)
}

object EmailImage extends Profile(width = Some(580), autoFormat = false) {
  override val qualityparam = "quality=60"
  val knownWidth = width.get
}

object EmailVideoImage extends Profile(width = Some(580), autoFormat = false) with OverlayBase64 {
  override val qualityparam = "quality=60"
  val overlayAlignParam = "overlay-align=center"
  val overlayUrlParam = s"overlay-base64=${overlayUrlBase64("play.png")}"

  override def resizeString: String = {
    val params = Seq(widthParam, heightParam, qualityparam, autoParam, dprParam, overlayAlignParam, overlayUrlParam).filter(_.nonEmpty).mkString("&")
    s"?$params"
  }
}

object FrontEmailImage extends Profile(width = Some(500), autoFormat = false) {
  override val qualityparam = "quality=60"
  val knownWidth = width.get
}

object SmallFrontEmailImage {
  def apply(customWidth: Int): SmallFrontEmailImage = new SmallFrontEmailImage(customWidth)
}
class SmallFrontEmailImage(customWidth: Int) extends Profile(Some(customWidth), autoFormat = false) {
  override val qualityparam = "quality=60"
}

// The imager/images.js base image.
object SeoOptimisedContentImage extends Profile(width = Some(460))

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile(None, None)

object ImgSrc extends Logging with implicits.Strings {

  private val imageServiceHost: String = Configuration.images.host

  private lazy val hostPrefixMapping: Map[String, String] = Map(
    "static.guim.co.uk" -> "static",
    "static-secure.guim.co.uk" -> "static",
    "media.guim.co.uk" -> "media",
    "uploads.guim.co.uk" -> "uploads"
  )

  private val supportedImages = Set(".jpg", ".jpeg", ".png")

  def apply(
    url: String,
    imageType: ElementProfile
  ): String = {
    try {
      val uri = new URI(url.trim.encodeURI)
      val isSupportedImage = supportedImages.exists(extension => uri.getPath.toLowerCase.endsWith(extension))

      hostPrefixMapping.get(uri.getHost)
        .filter(const(ImageServerSwitch.isSwitchedOn))
        .filter(const(isSupportedImage))
        .map { hostPrefix =>
          val signedPath = ImageUrlSigner.sign(s"${uri.getRawPath}${imageType.resizeString}")
          s"$imageServiceHost/img/$hostPrefix$signedPath"
        }.getOrElse(url)
    } catch {
      case error: URISyntaxException =>
        log.error("Unable to decode image url", error)
        url
    }
  }

  def srcset(imageContainer: ImageMedia, widths: WidthsByBreakpoint): String = {
    widths.profiles.map { profile => srcsetForProfile(profile, imageContainer, hidpi = false) } mkString ", "
  }

  def srcsetForBreakpoint(
    breakpointWidth: BreakpointWidth,
    breakpointWidths: Seq[BreakpointWidth],
    maybePath: Option[String] = None,
    maybeImageMedia: Option[ImageMedia] = None,
    hidpi: Boolean = false
  ): String = {
    val isPng = maybePath.exists(path => path.toLowerCase.endsWith("png"))
    breakpointWidth.toPixels(breakpointWidths)
      .map(browserWidth => Profile(width = Some(browserWidth), hidpi = hidpi, isPng = isPng))
      .map { profile => {
        maybePath
          .map(url => srcsetForProfile(profile, url, hidpi))
          .orElse(maybeImageMedia.map(imageContainer => srcsetForProfile(profile, imageContainer, hidpi)))
          .getOrElse("")
      } }
      .mkString(", ")
  }

  def srcsetForProfile(
    profile: Profile,
    imageContainer: ImageMedia,
    hidpi: Boolean
  ): String =
    s"${profile.bestSrcFor(imageContainer).get} ${profile.width.get * (if (hidpi) 2 else 1)}w"

  def srcsetForProfile(profile: Profile, path: String, hidpi: Boolean): String =
    s"${ImgSrc(path, profile)} ${profile.width.get * (if (hidpi) 2 else 1)}w"

  def getFallbackUrl(ImageElement: ImageMedia): Option[String] =
    Item300.bestSrcFor(ImageElement)

  def getAmpImageUrl(ImageElement: ImageMedia): Option[String] =
    Item620.bestSrcFor(ImageElement)

  def getFallbackAsset(ImageElement: ImageMedia): Option[ImageAsset] =
    Item300.bestFor(ImageElement)
}

object SeoThumbnail {
  def apply(page: Page): Option[String] = page match {
    case content: ContentPage => content.item.elements.thumbnail.flatMap(thumbnail => Item620.bestSrcFor(thumbnail.images))
    case _ => None
  }
}
