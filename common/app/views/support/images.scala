package views.support

import model.{ImageContainer, ImageAsset}
import conf.Switches.{ImageServerSwitch, ImageServiceSwitch}
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

  val resizeString = s"${toResizeString(width)}:${toResizeString(height)}"

  private def toResizeString(size: Option[Int]) = size.map(_.toString).getOrElse("*")
}

// Configuration of our different image profiles
object Contributor extends Profile("c", Some(140), Some(140), 70) {}
object GalleryLargeImage extends Profile("gli", Some(1024), None, 70) {}
object GalleryLargeTrail extends Profile("glt", Some(480), Some(288), 70) {}
object GallerySmallTrail extends Profile("gst", Some(280), Some(168), 70) {}
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
    Naked,
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
  val imageServiceHost = Configuration.images.servicePath

  def apply(url: String, imageType: Profile): String = {
    val uri = new URI(url.trim)

    val isSupportedImage =
      uri.getHost == "static.guim.co.uk" &&
      !uri.getPath.toLowerCase.endsWith(".gif")

    if (ImageServerSwitch.isSwitchedOn && isSupportedImage) {

      if(ImageServiceSwitch.isSwitchedOn) {
        // this is the img for the CDN image service test
        // NOTE the order of the parameters is important - read the docs...
        s"$imageServiceHost${uri.getPath}?interpolation=progressive-bilinear&downsize=${imageType.resizeString}"
      } else {
        // this is our current image
        s"$imageHost/${imageType.prefix}${uri.getPath}"
      }


    } else url
  }

  object Imager extends Profile("item-{width}", None, None, 70) {
    override val resizeString = s"{width}:*"
  }

  // always, and I mean ALWAYS think carefully about the size image you use
  def imager(imageContainer: ImageContainer, profile: Profile): Option[String] = {
    profile.elementFor(imageContainer).flatMap(_.url).map{ largestImage =>
      ImgSrc(largestImage, Imager)
    }
  }

}

