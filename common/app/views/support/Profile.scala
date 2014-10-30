package views.support

import model.{Content, MetaData, ImageContainer, ImageAsset}
import conf.Switches.{ImageServerSwitch, PngResizingSwitch}
import java.net.URI
import org.apache.commons.math3.fraction.Fraction
import org.apache.commons.math3.util.Precision
import conf.Configuration

trait ElementProfile {

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
object Contributor extends Profile(Some(140), Some(140))
object GalleryInitialImage extends Profile(Some(300), None)
object GalleryUpgradedImage extends Profile(Some(800), None)
object GalleryLargeImage extends Profile(Some(1024), None)
object GalleryLargeTrail extends Profile(Some(480), Some(288))
object GallerySmallTrail extends Profile(Some(280), Some(168))
object Showcase extends Profile(Some(860), None)
object Item120 extends Profile(Some(120), None)
object Item140 extends Profile(Some(140), None)
object Item220 extends Profile(Some(220), None)
object Item300 extends Profile(Some(300), None)
object Item460 extends Profile(Some(460), None)
object Item620 extends Profile(Some(620), None)
object Item640 extends Profile(Some(640), None)
object Item700 extends Profile(Some(700), None)
object Item940 extends Profile(Some(940), None)
object Video640 extends VideoProfile(Some(640), Some(360)) // 16:9
object Video460 extends VideoProfile(Some(460), Some(276)) // 5:3
object SeoOptimisedContentImage extends Profile(width = Some(460))

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile(None, None)

object Profile {
  lazy val all = Seq(
    Contributor,
    GalleryLargeImage,
    GalleryLargeTrail,
    GallerySmallTrail,
    Naked,
    Showcase,
    Item140,
    Item220,
    Item300,
    Item460,
    Item620,
    Item640,
    Item700,
    Item940
  )
}

object ImgSrc {

  private val imageHost = Configuration.images.path

  private val hostPrefixMapping = Map(
    "static.guim.co.uk" -> "static",
    "media.guim.co.uk" -> "media"
  )

  def apply(url: String, imageType: ElementProfile): String = {
    val uri = new URI(url.trim)

    val supportedImages = if(PngResizingSwitch.isSwitchedOn) Seq(".jpg", ".jpeg", ".png") else Seq(".jpg", ".jpeg")
    val isSupportedImage = supportedImages.exists(extension => uri.getPath.toLowerCase.endsWith(extension))

    hostPrefixMapping.get(uri.getHost)
      .filter(_ => isSupportedImage)
      .filter(_ => ImageServerSwitch.isSwitchedOn)
      .map( pathPrefix =>
        s"$imageHost/$pathPrefix${imageType.resizeString}${uri.getPath}"
      ).getOrElse(url)
  }

  object Imager extends Profile(None, None) {
    override def resizeString = "/w-{width}/h--/q-95"
  }

  // always, and I mean ALWAYS think carefully about the size image you use
  def imager(imageContainer: ImageContainer, profile: Profile): Option[String] = {
    profile.elementFor(imageContainer).flatMap(_.url).map{ largestImage =>
      ImgSrc(largestImage, Imager)
    }
  }

  def imager(imageContainer: ImageContainer, maxWidth: Int): Option[String] = {
    // get largest profile closest to the width
    val sortedProfiles: Seq[Profile] = Profile.all.filter(_.height == None).sortBy(_.width)
    sortedProfiles.find(_.width.getOrElse(0) >= maxWidth).orElse(sortedProfiles.reverse.headOption).flatMap{ profile =>
      imager(imageContainer, profile)
    }
  }

}

object SeoThumbnail {
  def apply(metadata: MetaData): Option[String] = metadata match {
    case content: Content => content.thumbnail.flatMap(Item620.bestFor)
    case _ => None
  }
}
