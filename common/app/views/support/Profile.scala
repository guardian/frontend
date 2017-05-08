package views.support

import java.net.{URI, URISyntaxException}
import java.util.Base64
import common.Logging
import conf.switches.Switches.{ImageServerSwitch, FacebookShareImageLogoOverlay, TwitterShareImageLogoOverlay}
import conf.Configuration
import layout.{BreakpointWidth, WidthsByBreakpoint}
import model._
import org.apache.commons.math3.fraction.Fraction
import org.apache.commons.math3.util.Precision
import Function.const

sealed trait ElementProfile {

  def width: Option[Int]
  def height: Option[Int]
  def hidpi: Boolean
  def compression: Int
  def isPng: Boolean
  def autoFormat: Boolean

  def elementFor(image: ImageMedia): Option[ImageAsset] = {
    val sortedCrops = image.imageCrops.sortBy(-_.width)
    width.flatMap{ desiredWidth =>
      sortedCrops.find(_.width >= desiredWidth)
    }.orElse(image.largestImage)
  }

  def largestFor(image: ImageMedia): Option[ImageAsset] = image.largestImage

  def bestFor(image: ImageMedia): Option[String] =
    elementFor(image).flatMap(_.url).map{ url => ImgSrc(url, this) }

  def captionFor(image: ImageMedia): Option[String] =
    elementFor(image).flatMap(_.caption)

  def altTextFor(image: ImageMedia): Option[String] =
    elementFor(image).flatMap(_.altText)

  // NOTE - if you modify this in any way there is a decent chance that you decache all our images :(
  val qualityparam = if (hidpi) {"q=20"} else {"q=55"}
  val autoParam = if (autoFormat) "auto=format" else ""
  val sharpParam = "usm=12"
  val fitParam = "fit=max"
  val dprParam = if (hidpi) {
    if (isPng) {
      "dpr=1.3"
    } else {
      "dpr=2"
    }
  } else {""}
  val heightParam = height.map(pixels => s"h=$pixels").getOrElse("")
  val widthParam = width.map(pixels => s"w=$pixels").getOrElse("")

  def resizeString: String = {
    val params = Seq(widthParam, heightParam, qualityparam, autoParam, sharpParam, fitParam, dprParam).filter(_.nonEmpty).mkString("&")
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

abstract class ShareImage(shouldIncludeOverlay: Boolean) extends Profile(width = Some(1200)) {
  override val heightParam = "h=630"
  override val fitParam = "fit=crop"
  val cropParam = "crop=faces%2Centropy"
  val blendModeParam = "bm=normal"
  val blendOffsetParam = "ba=bottom%2Cleft"
  val blendImageParam: String

  override def resizeString: String = {
    if(shouldIncludeOverlay) {
      val params = Seq(widthParam, heightParam, qualityparam, autoParam, sharpParam, fitParam, dprParam, cropParam, blendModeParam, blendOffsetParam, blendImageParam).filter(_.nonEmpty).mkString("&")
      s"?$params"
    } else {
      super.resizeString
    }
  }
}

object TwitterImage extends ShareImage(TwitterShareImageLogoOverlay.isSwitchedOn) {
  override val blendImageParam = "blend64=aHR0cHM6Ly91cGxvYWRzLmd1aW0uY28udWsvMjAxNi8wNi8wNy9vdmVybGF5LWxvZ28tMTIwMC05MF9vcHQucG5n"
}

object FacebookOpenGraphImage extends ShareImage(FacebookShareImageLogoOverlay.isSwitchedOn) {
  override val blendImageParam = "blend64=aHR0cHM6Ly91cGxvYWRzLmd1aW0uY28udWsvMjAxNi8wNS8yNS9vdmVybGF5LWxvZ28tMTIwMC05MF9vcHQucG5n"
}

object EmailImage extends Profile(width = Some(580), autoFormat = false) {
  override val qualityparam = "q=40"
  val knownWidth = width.get
}

object EmailVideoImage extends Profile(width = Some(580), autoFormat = false) {
  override val fitParam = "fit=crop"
  override val qualityparam = "q=40"
  val blendModeParam = "bm=normal"
  val blendOffsetParam = "ba=center"
  val blendImageParam = s"blend64=${Base64.getUrlEncoder.encodeToString(EmailHelpers.Images.play.getBytes)}"

  override def resizeString: String = {
    val params = Seq(widthParam, heightParam, qualityparam, autoParam, sharpParam, fitParam, dprParam, blendModeParam, blendOffsetParam, blendImageParam).filter(_.nonEmpty).mkString("&")
    s"?$params"
  }
}

object FrontEmailImage extends Profile(width = Some(500), autoFormat = false) {
  override val qualityparam = "q=40"
  val knownWidth = width.get
}

object SmallFrontEmailImage {
  def apply(customWidth: Int) = new SmallFrontEmailImage(customWidth)
}
class SmallFrontEmailImage(customWidth: Int) extends Profile(Some(customWidth), autoFormat = false) {
  override val qualityparam = "q=40"
}

// The imager/images.js base image.
object SeoOptimisedContentImage extends Profile(width = Some(460))

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile(None, None)

object ImgSrc extends Logging with implicits.Strings {

  private lazy val imageHost = Configuration.images.path

  private case class HostMapping(prefix: String, token: String)

  private lazy val hostPrefixMapping: Map[String, HostMapping] = Map(
    "static.guim.co.uk" -> HostMapping("static", Configuration.images.backends.staticToken),
    "static-secure.guim.co.uk" -> HostMapping("static", Configuration.images.backends.staticToken),
    "media.guim.co.uk" -> HostMapping("media", Configuration.images.backends.mediaToken),
    "uploads.guim.co.uk" -> HostMapping("uploads", Configuration.images.backends.uploadsToken)
  )

  def tokenFor(host:String): Option[String] = hostPrefixMapping.get(host).map(_.token)

  private val supportedImages = Set(".jpg", ".jpeg", ".png")

  def apply(url: String, imageType: ElementProfile): String = {
    try {
      val uri = new URI(url.trim.encodeURI)
      val isSupportedImage = supportedImages.exists(extension => uri.getPath.toLowerCase.endsWith(extension))

      hostPrefixMapping.get(uri.getHost)
        .filter(const(ImageServerSwitch.isSwitchedOn))
        .filter(const(isSupportedImage))
        .map { host =>
          val signedPath = ImageUrlSigner.sign(s"${uri.getRawPath}${imageType.resizeString}", host.token)
          s"$imageHost/img/${host.prefix}$signedPath"
        }.getOrElse(url)
    } catch {
      case error: URISyntaxException =>
        log.error("Unable to decode image url", error)
        url
    }
  }

  def findNearestSrc(ImageElement: ImageMedia, profile: Profile): Option[String] = {
    profile.elementFor(ImageElement).flatMap(_.url).map{ largestImage =>
      ImgSrc(largestImage, profile)
    }
  }

  def findLargestSrc(ImageElement: ImageMedia, profile: Profile): Option[String] = {
    profile.largestFor(ImageElement).flatMap(_.url).map{ largestImage =>
      ImgSrc(largestImage, profile)
    }
  }

  def srcset(imageContainer: ImageMedia, widths: WidthsByBreakpoint): String = {
    widths.profiles.map { profile => srcsetForProfile(profile, imageContainer, hidpi = false) } mkString ", "
  }

  def srcsetForBreakpoint(breakpointWidth: BreakpointWidth, breakpointWidths: Seq[BreakpointWidth], maybePath: Option[String] = None, maybeImageMedia: Option[ImageMedia] = None, hidpi: Boolean = false): String = {
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

  def srcsetForProfile(profile: Profile, imageContainer: ImageMedia, hidpi: Boolean): String = {
    if(ImageServerSwitch.isSwitchedOn) {
      s"${findLargestSrc(imageContainer, profile).get} ${profile.width.get * (if (hidpi) 2 else 1)}w"
    } else {
      s"${findNearestSrc(imageContainer, profile).get} ${profile.width.get * (if (hidpi) 2 else 1)}w"
    }
  }

  def srcsetForProfile(profile: Profile, path: String, hidpi: Boolean): String = {
    s"${ImgSrc(path, profile)} ${profile.width.get * (if (hidpi) 2 else 1)}w"
  }

  def getFallbackUrl(ImageElement: ImageMedia): Option[String] = {
    if(ImageServerSwitch.isSwitchedOn) {
      findLargestSrc(ImageElement, Item300)
    } else {
      findNearestSrc(ImageElement, Item300)
    }
  }

  def getAmpImageUrl(ImageElement: ImageMedia): Option[String] = {
    findNearestSrc(ImageElement, Item620)
  }

  def getFallbackAsset(ImageElement: ImageMedia): Option[ImageAsset] = {
    Item300.elementFor(ImageElement)
  }
}

object SeoThumbnail {
  def apply(page: Page): Option[String] = page match {
    case content: ContentPage => content.item.elements.thumbnail.flatMap(thumbnail => Item620.bestFor(thumbnail.images))
    case _ => None
  }
}
