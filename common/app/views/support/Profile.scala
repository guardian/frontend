package views.support

import java.net.{URI, URISyntaxException}
import common.Logging
import conf.switches.Switches.ImageServerSwitch
import conf.Configuration
import layout.WidthsByBreakpoint
import model._
import org.apache.commons.math3.fraction.Fraction
import org.apache.commons.math3.util.Precision
import Function.const

sealed trait ElementProfile {

  def width: Option[Int]
  def height: Option[Int]
  def compression: Int

  def elementFor(image: ImageContainer): Option[ImageAsset] = {
    val sortedCrops = image.imageCrops.sortBy(-_.width)
    width.flatMap{ desiredWidth =>
      sortedCrops.find(_.width >= desiredWidth)
    }.orElse(image.largestImage)
  }

  def largestFor(image: ImageContainer): Option[ImageAsset] = image.largestImage

  def bestFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.url).map{ url => ImgSrc(url, this) }

  def captionFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.caption)

  def altTextFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.altText)

  // NOTE - if you modify this in any way there is a decent chance that you decache all our images :(
  lazy val resizeString = {
    val qualityparam = "q=85"
    val autoParam = "auto=format"
    val sharpParam = "sharp=10"
    val heightParam = height.map(pixels => s"h=$pixels").getOrElse("")
    val widthParam = width.map(pixels => s"w=$pixels").getOrElse("")

    val params = Seq(widthParam, heightParam, qualityparam, autoParam, sharpParam).filter(_.nonEmpty).mkString("&")
    s"?$params"
  }

  private def toResizeString(i: Option[Int]) = i.map(_.toString).getOrElse("-")
}

case class Profile(
  override val width: Option[Int] = None,
  override val height: Option[Int] = None,
  override val compression: Int = 95) extends ElementProfile

object VideoProfile {
  lazy val ratioHD = new Fraction(16,9)
}

case class VideoProfile(
  override val width: Some[Int],
  override val height: Some[Int],
  override val compression: Int = 95) extends ElementProfile {

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
object Video640 extends VideoProfile(width = Some(640), height = Some(360)) // 16:9
object FacebookOpenGraphImage extends Profile(width = Some(1200))

// The imager/images.js base image.
object SeoOptimisedContentImage extends Profile(width = Some(460))

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile(None, None)

object ImgSrc extends Logging {

  private val imageHost = Configuration.images.path

  private case class HostMapping(prefix: String, token: String)

  private lazy val hostPrefixMapping: Map[String, HostMapping] = Map(
    "static.guim.co.uk" -> HostMapping("static", Configuration.images.backends.staticToken),
    "media.guim.co.uk" -> HostMapping("media", Configuration.images.backends.mediaToken)
  )

  def tokenFor(host:String): Option[String] = hostPrefixMapping.get(host).map(_.token)

  private val supportedImages = Set(".jpg", ".jpeg", ".png")

  def apply(url: String, imageType: ElementProfile): String = {
    try {
      val uri = new URI(url.trim)

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

  def findNearestSrc(imageContainer: ImageContainer, profile: Profile): Option[String] = {
    profile.elementFor(imageContainer).flatMap(_.url).map{ largestImage =>
      ImgSrc(largestImage, profile)
    }
  }

  private def findLargestSrc(imageContainer: ImageContainer, profile: Profile): Option[String] = {
    profile.largestFor(imageContainer).flatMap(_.url).map{ largestImage =>
      ImgSrc(largestImage, profile)
    }
  }

  def srcset(imageContainer: ImageContainer, widths: WidthsByBreakpoint): String = {
    widths.profiles.map { profile =>
      if(ImageServerSwitch.isSwitchedOn) {
        s"${findLargestSrc(imageContainer, profile).get} ${profile.width.get}w"
      } else {
        s"${findNearestSrc(imageContainer, profile).get} ${profile.width.get}w"
      }
    } mkString ", "
  }

  def srcset(path: String, widths: WidthsByBreakpoint): String = {
    widths.profiles map { profile =>
      s"${ImgSrc(path, profile)} ${profile.width.get}w"
    } mkString ", "
  }

  def getFallbackUrl(imageContainer: ImageContainer): Option[String] = {
    if(ImageServerSwitch.isSwitchedOn) {
      findLargestSrc(imageContainer, Item300)
    } else {
      findNearestSrc(imageContainer, Item300)
    }
  }

  def getFallbackAsset(imageContainer: ImageContainer): Option[ImageAsset] = {
    Item300.elementFor(imageContainer)
  }
}

object SeoThumbnail {
  def apply(page: Page): Option[String] = page match {
    case content: ContentPage => content.item.elements.thumbnail.flatMap(Item620.bestFor)
    case _ => None
  }
}
