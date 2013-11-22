package views.support

import model.{ImageElement, ImageContainer, ImageAsset}
import conf.Switches.ImageServerSwitch
import java.net.URI
import conf.Configuration

case class Profile(prefix: String, width: Option[Int] = None, height: Option[Int] = None, compression: Int = 10) {

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
}

// Configuration of our different image profiles
object Contributor extends Profile("c", Some(140), Some(140), 70) {}
object GalleryLargeImage extends Profile("gli", Some(1024), None, 70) {}
object GalleryLargeTrail extends Profile("glt", Some(480), Some(288), 70) {}
object GallerySmallTrail extends Profile("gst", Some(280), Some(168), 70) {}
object FeaturedTrail extends Profile("f", Some(640), None, 70) {}
object ArticleMainPicture extends Profile("a", Some(640), None, 70) {}
object LargeThumbnail extends Profile("thumb", Some(220), None, 70)
object Item140 extends Profile("item-140", Some(140), None, 70) {}
object Item220 extends Profile("item-220", Some(220), None, 70) {}
object Item300 extends Profile("item-300", Some(300), None, 70) {}
object Item460 extends Profile("item-460", Some(460), None, 70) {}
object Item620 extends Profile("item-620", Some(620), None, 70) {}
object Item700 extends Profile("item-700", Some(700), None, 70) {}

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile("n", None, None, 70) {}

object Profile {
  lazy val all = Seq(
    Contributor,
    GalleryLargeImage,
    GalleryLargeTrail,
    GallerySmallTrail,
    FeaturedTrail,
    Naked,
    ArticleMainPicture,
    LargeThumbnail,
    Item140,
    Item220,
    Item300,
    Item460,
    Item620,
    Item700
  )
}


object ImgSrc {

  val imageHost = Configuration.images.path

  def apply(url: String, imageType: Profile): String = {
    val uri = new URI(url.trim)

    val isSupportedImage =
      uri.getHost == "static.guim.co.uk" &&
      !uri.getPath.toLowerCase().endsWith(".gif")

    if (ImageServerSwitch.isSwitchedOn && isSupportedImage) {
      s"$imageHost/${imageType.prefix}${uri.getPath}"
    } else s"${url}"
  }

  def imager(imageContainer: ImageContainer): Option[String] = {
    imageContainer.largestImage.flatMap { largestImage =>
      largestImage.url.map { url =>
        ImgSrc(url, Profile("item-{width}"))
      }
    }
  }

}

