package views.support

import model.{ImageContainer, ImageAsset}
import conf.Switches.{ImageServerSwitch, ThirdPartyImageServiceSwitch, NewImageServerSwitch}
import java.net.URI
import conf.Configuration
import play.api.templates.Html

case class Profile(prefix: String, width: Option[Int] = None, height: Option[Int] = None, compression: Int = 95) {

  def elementFor(image: ImageContainer): Option[ImageAsset] = {
    val sortedCorps = image.imageCrops.sortBy(_.width)
    width.flatMap{ desiredWidth =>
      sortedCorps.find(_.width >= desiredWidth)
    }.orElse(image.largestImage)
  }

  def bestFor(image: ImageContainer): Option[Html] =
    elementFor(image).flatMap(_.url).map{ url => ImgSrc(url, this) }

  def captionFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.caption)

  def altTextFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.altText)

  // TODO sorry about the duplication, some of this just needs to live side by side for a while
  val thirdPartyResizeString = s"${toThirdPartyResizeString(width)}:${toThirdPartyResizeString(height)}"
  val resizeString = s"width=${toResizeString(width)}&height=${toResizeString(height)}&quality=$compression"

  private def toThirdPartyResizeString(size: Option[Int]) = size.map(_.toString).getOrElse("*")
  private def toResizeString(i: Option[Int]) = i.map(_.toString).getOrElse("-")
}

// Configuration of our different image profiles
object Contributor extends Profile("c", Some(140), Some(140))
object GalleryLargeImage extends Profile("gli", Some(1024), None)
object GalleryLargeTrail extends Profile("glt", Some(480), Some(288))
object GallerySmallTrail extends Profile("gst", Some(280), Some(168))
object Item140 extends Profile("item-140", Some(140), None)
object Item220 extends Profile("item-220", Some(220), None)
object Item300 extends Profile("item-300", Some(300), None)
object Item460 extends Profile("item-460", Some(460), None)
object Item620 extends Profile("item-620", Some(620), None)
object Item700 extends Profile("item-700", Some(700), None)

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile("n", None, None)

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

  def apply(url: String, imageType: Profile): Html = {
    val uri = new URI(url.trim)

    val isSupportedImage = uri.getHost == "static.guim.co.uk" && !uri.getPath.toLowerCase.endsWith(".gif")

    if (ImageServerSwitch.isSwitchedOn && isSupportedImage)
      Html(useImageServiceFor(uri, imageType))
    else 
      Html(dontUseImageServiceFor(url))
  }
  
  // TODO sorry for all these switches
  // We will simplify as soon as possible (i.e. once the planets align)
  private def useImageServiceFor(uri: URI, imageType: Profile) = {
    if(ThirdPartyImageServiceSwitch.isSwitchedOn) {
      // this is the img for the CDN image service test (a trial we are running)
      // NOTE the order of the parameters is important - read the docs...
      s"$imageServiceHost${uri.getPath}?interpolation=progressive-bilinear&downsize=${imageType.thirdPartyResizeString}"
    } else if (NewImageServerSwitch.isSwitchedOn) {
      // this is our own image server
      s"$imageHost${uri.getPath}?${imageType.resizeString}"
    } else {
      // this is legacy and will be killed off
      s"$imageHost/${imageType.prefix}${uri.getPath}"
    }
    
  }

  private def dontUseImageServiceFor(url: String) = url

  object Imager extends Profile("item-{width}", None, None) {
    override val thirdPartyResizeString = s"{width}:*"
    override val resizeString = s"width={width}&height=-&quality=$compression"
  }
  
  // always, and I mean ALWAYS think carefully about the size image you use
  def imager(imageContainer: ImageContainer, profile: Profile): Option[Html] = {
    profile.elementFor(imageContainer).flatMap(_.url).map{ largestImage =>
      ImgSrc(largestImage, Imager)
    }
  }

}

