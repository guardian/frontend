package views.support

import model.ImageAsset
import conf.Switches.ImageServerSwitch
import java.net.URI
import conf.Configuration

case class Profile(prefix: String, width: Option[Int] = None, height: Option[Int] = None, compression: Int = 10) {}

// Configuration of our different image profiles
object Contributor extends Profile("c", Some(140), Some(140), 70) {}
object GalleryLargeImage extends Profile("gli", Some(1024), None, 70) {}
object GalleryLargeTrail extends Profile("glt", Some(480), Some(288), 70) {}
object GallerySmallTrail extends Profile("gst", Some(280), Some(168), 70) {}
object FeaturedTrail extends Profile("f", Some(640), None, 70) {}
object ArticleMainPicture extends Profile("a", Some(640), None, 70) {}
object FrontItem extends Profile("fi", Some(300), None, 70) {}
object FrontItemMobile extends Profile("fi-mobile", Some(140), None, 70) {}
object FrontItemMain extends Profile("fim", Some(620), None, 70) {}
object FrontItemMainMobile extends Profile("fim-mobile", Some(300), None, 70) {}

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
    FrontItem,
    FrontItemMobile,
    FrontItemMain,
    FrontItemMainMobile
  )
}


object ImgSrc {

  val imageHost = Configuration.images.path

  def apply(image: ImageAsset, imageType: Profile): String = image.url.map{ url => apply(url, imageType) }.getOrElse("")

  def apply(url: String, imageType: Profile): String = {
    val uri = new URI(url.trim)

    val isSupportedImage =
      uri.getHost == "static.guim.co.uk" &&
      !uri.getPath.toLowerCase().endsWith(".gif")

    if (ImageServerSwitch.isSwitchedOn && isSupportedImage) {
      s"$imageHost/${imageType.prefix}${uri.getPath}"
    } else s"${url}"
  }
}

