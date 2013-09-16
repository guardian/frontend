package views.support

import model.ImageAsset
import conf.Switches.ImageServerSwitch
import java.net.URI
import conf.Configuration

sealed trait ImageType {
  def prefix: String
}

object Contributor extends ImageType {
  val prefix = "c"
}

object Naked extends ImageType {
  val prefix = "n"
}

object GalleryLargeTrail extends ImageType {
  val prefix = "glt"
}

object GallerySmallTrail extends ImageType {
  val prefix = "gst"
}

object ImgSrc {

  val imageHost = Configuration.images.path

  def apply(image: ImageAsset, imageType: ImageType): String = image.url.map{ url => apply(url, imageType) }.getOrElse("")

  def apply(url: String, imageType: ImageType): String = {
    val uri = new URI(url.trim)

    val isSupportedImage =
      uri.getHost == "static.guim.co.uk" &&
      !uri.getPath.toLowerCase().endsWith(".gif")

    if (ImageServerSwitch.isSwitchedOn && isSupportedImage) {
      s"$imageHost/${imageType.prefix}${uri.getPath}"
    } else s"${url}"
  }
}

