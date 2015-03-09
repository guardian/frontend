package views.support

import layout.BrowserWidth
import model.{Content, MetaData, ImageContainer, ImageAsset}
import conf.Switches.{ImageServerSwitch, PngResizingSwitch}
import java.net.URI
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

sealed case class Profile(
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
object GalleryInitialImage extends Profile(width = Some(300))
object GalleryUpgradedImage extends Profile(width = Some(800))
object GalleryLargeImage extends Profile(width = Some(1024))
object GalleryLargeTrail extends Profile(width = Some(480), height = Some(288))
object GallerySmallTrail extends Profile(width = Some(280), height = Some(168))
object Item120 extends Profile(width = Some(120))
object Item140 extends Profile(width = Some(140))
object Item160 extends Profile(width = Some(160))
object Item220 extends Profile(width = Some(220))
object Item300 extends Profile(width = Some(300))
object Item360 extends Profile(width = Some(360))
object Item460 extends Profile(width = Some(460))
object Item620 extends Profile(width = Some(620))
object Item640 extends Profile(width = Some(640))
object Item700 extends Profile(width = Some(700))
object Item860 extends Profile(width = Some(860))
object Item940 extends Profile(width = Some(940))
object Video640 extends VideoProfile(width = Some(640), height = Some(360)) // 16:9
object Video460 extends VideoProfile(width = Some(460), height = Some(276)) // 5:3
object SeoOptimisedContentImage extends Profile(width = Some(460))

object ContentThumbnail extends Profile(width = Some(140))
object ContentSupporting extends Profile(width = Some(380))
object ContentStandard extends Profile(width = Some(620))
object ContentShowcase extends Profile(width = Some(860))

object Item115 extends Profile(width = Some(115))
object Item127 extends Profile(width = Some(127))
object Item130 extends Profile(width = Some(130))
object Item187 extends Profile(width = Some(187))
object Item188 extends Profile(width = Some(188))
object Item216 extends Profile(width = Some(216))
object Item331 extends Profile(width = Some(331))
object Item340 extends Profile(width = Some(340))
object Item350 extends Profile(width = Some(350))
object Item389 extends Profile(width = Some(389))
object Item520 extends Profile(width = Some(520))

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile(None, None)

object Profile {
  // Do NOT make this strict. The compiler gets confused and stuff.
  lazy val all: Seq[Profile] = Seq(
    Contributor,
    GalleryInitialImage,
    GalleryUpgradedImage,
    GalleryLargeImage,
    GalleryLargeTrail,
    GallerySmallTrail,
    Item120,
    Item140,
    Item220,
    Item300,
    Item360,
    Item460,
    Item620,
    Item640,
    Item700,
    Item940,
    SeoOptimisedContentImage
  )

  // image widths available to <picture> and <img srcset>
  lazy val images: Seq[Profile] = Seq(
    Item127,
    Item140,
    Item160,
    Item188,
    Item220,
    Item300,
    Item340,
    Item350,
    Item460,
    Item520,
    Item620,
    Item700,
    Item860,
    Item940
  )

  // image widths available to cutout images
  lazy val cutoutImages: Seq[Profile] = Seq(
    Item115,
    Item130,
    Item187,
    Item216,
    Item331,
    Item389
  )

  lazy val imageWidths: Seq[Int] = images.flatMap(_.width)
}

object ImgSrc {

  private val imageHost = Configuration.images.path

  private val hostPrefixMapping = Map(
    "static.guim.co.uk" -> "static",
    "media.guim.co.uk" -> "media"
  )

  def apply(url: String, imageType: ElementProfile): String = {
    val uri = new URI(url.trim)

    val supportedImages = if(PngResizingSwitch.isSwitchedOn) Set(".jpg", ".jpeg", ".png") else Set(".jpg", ".jpeg")

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
    val sortedProfiles = Profile.all.filter(_.height == None).sortBy(_.width)
    sortedProfiles.find(_.width.getOrElse(0) >= maxWidth).orElse(sortedProfiles.reverse.headOption).flatMap{ profile =>
      imager(imageContainer, profile)
    }
  }

  def srcset(imageContainer: ImageContainer, maxWidth: Int): String = {
    Profile.images.filter(_.width.getOrElse(0) <= maxWidth).map { profile =>
      s"${srcForProfile(profile, imageContainer).get} ${profile.width.get}w"
    } mkString ", "
  }

  def srcsetForCutout(path: String): String = {
    Profile.cutoutImages map { profile =>
      s"${ImgSrc(path, profile)} ${profile.width.get}w"
    } mkString ", "
  }

  private def srcForProfile(profile: Profile, imageContainer: ImageContainer) = {
    profile.elementFor(imageContainer).flatMap(_.url).map{ largestImage =>
      ImgSrc(largestImage, profile)
    }
  }

  def getUrl(imageContainer: ImageContainer, maxWidth: Int): Option[String] = {
    // get largest profile closest to the width
    val sortedProfiles = Profile.all.filter(_.height == None).sortBy(_.width)
    sortedProfiles.find(_.width.getOrElse(0) >= maxWidth).orElse(sortedProfiles.reverse.headOption).flatMap{ profile =>
      srcForProfile(profile, imageContainer)
    }
  }

  def getFallbackUrl(imageContainer: ImageContainer, profile: Profile = Item300): Option[String] = {
    srcForProfile(profile, imageContainer)
  }
}

object SeoThumbnail {
  def apply(metadata: MetaData): Option[String] = metadata match {
    case content: Content => content.thumbnail.flatMap(Item620.bestFor)
    case _ => None
  }
}
