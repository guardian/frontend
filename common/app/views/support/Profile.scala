package views.support

import common.Logging
import layout.WidthsByBreakpoint
import model.{Content, MetaData, ImageContainer, ImageAsset}
import conf.Switches.{ImageServerSwitch, PngResizingSwitch}
import java.net.{URISyntaxException, URI}
import org.apache.commons.math3.fraction.Fraction
import org.apache.commons.math3.util.Precision
import conf.Configuration

sealed trait ElementProfile {

  def width: Option[Int]
  def height: Option[Int]
  def compression: Int

  def elementFor(image: ImageContainer): Option[ImageAsset] = {
    val sortedCorps = image.imageCrops.sortBy(_.width)
    width.flatMap{ desiredWidth =>
      sortedCorps.find(_.width >= desiredWidth)
    }.orElse(image.largestImage)
  }

  def bestFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.url).map{ url => ImgSrc(url, this) }

  def captionFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.caption)

  def altTextFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.altText)

  def resizeString = s"/w-${toResizeString(width)}/h-${toResizeString(height)}/q-$compression"


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
object Item120 extends Profile(width = Some(120))
object Item140 extends Profile(width = Some(140))
object Item300 extends Profile(width = Some(300))
object Item460 extends Profile(width = Some(460))
object Item620 extends Profile(width = Some(620))
object Item640 extends Profile(width = Some(640))
object Item700 extends Profile(width = Some(700))
object Video640 extends VideoProfile(width = Some(640), height = Some(360)) // 16:9

// The imager/images.js base image.
object SeoOptimisedContentImage extends Profile(width = Some(460))

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile(None, None)

object ImgSrc extends Logging {

  private val imageHost = Configuration.images.path

  private val hostPrefixMapping = Map(
    "static.guim.co.uk" -> "static",
    "media.guim.co.uk" -> "media"
  )

  def apply(url: String, imageType: ElementProfile): String = {
    try {
      val uri = new URI(url.trim)

      val supportedImages = if(PngResizingSwitch.isSwitchedOn) Set(".jpg", ".jpeg", ".png") else Set(".jpg", ".jpeg")

      val isSupportedImage = supportedImages.exists(extension => uri.getPath.toLowerCase.endsWith(extension))

      hostPrefixMapping.get(uri.getHost)
        .filter(_ => isSupportedImage)
        .filter(_ => ImageServerSwitch.isSwitchedOn)
        .map( pathPrefix =>
        s"$imageHost/$pathPrefix${imageType.resizeString}${uri.getPath}"
        ).getOrElse(url)
    } catch {
      case error: URISyntaxException =>
        log.error("Unable to decode image url", error)
        url
    }
  }

  // always, and I mean ALWAYS think carefully about the size image you use
  def findSrc(imageContainer: ImageContainer, profile: Profile): Option[String] = {
    profile.elementFor(imageContainer).flatMap(_.url).map{ largestImage =>
      ImgSrc(largestImage, profile)
    }
  }

  def srcset(imageContainer: ImageContainer, widths: WidthsByBreakpoint): String = {
    widths.profiles.map { profile =>
      s"${findSrc(imageContainer, profile).get} ${profile.width.get}w"
    } mkString ", "
  }

  def srcset(path: String, widths: WidthsByBreakpoint): String = {
    widths.profiles map { profile =>
      s"${ImgSrc(path, profile)} ${profile.width.get}w"
    } mkString ", "
  }

  def getFallbackUrl(imageContainer: ImageContainer): Option[String] = {
    findSrc(imageContainer, Item300)
  }

  def getFallbackAsset(imageContainer: ImageContainer): Option[ImageAsset] = {
    Item300.elementFor(imageContainer)
  }
}

object SeoThumbnail {
  def apply(metadata: MetaData): Option[String] = metadata match {
    case content: Content => content.thumbnail.flatMap(Item620.bestFor)
    case _ => None
  }
}
