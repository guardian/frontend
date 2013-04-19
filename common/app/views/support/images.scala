package views.support

import model.Image
import conf.CommonSwitches.ImageServerSwitch
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

object ImgSrc {

  val imageHost = Configuration.images.path

  def apply(image: Image, imageType: ImageType): String = image.url.map{ url => apply(url, imageType) }.getOrElse("")

  def apply(url: String, imageType: ImageType): String = if (ImageServerSwitch.isSwitchedOn) {
    val uri = new URI(url)
    s"$imageHost/${imageType.prefix}${uri.getPath}"
  } else s"${url}"


}
