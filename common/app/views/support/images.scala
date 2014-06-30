package views.support

import model.{Content, MetaData, ImageContainer, ImageAsset}
import conf.Switches.{ImageServerSwitch, ParameterlessImagesSwitch, SeoOptimisedContentImageSwitch}
import java.net.URI
import conf.Configuration

case class Profile(width: Option[Int] = None, height: Option[Int] = None, compression: Int = 95) {

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

  def resizeString = if (ParameterlessImagesSwitch.isSwitchedOn) {
    s"/w-${toResizeString(width)}/h-${toResizeString(height)}/q-$compression"
  } else {
    s"width=${toResizeString(width)}&height=${toResizeString(height)}&quality=$compression"
  }

  private def toResizeString(i: Option[Int]) = i.map(_.toString).getOrElse("-")
}

// Configuration of our different image profiles
object Contributor extends Profile(Some(140), Some(140))
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

  def imageHost = Configuration.images.path

  def apply(url: String, imageType: Profile): String = {
    val uri = new URI(url.trim)

    val isSupportedImage = uri.getHost == "static.guim.co.uk" && !uri.getPath.toLowerCase.endsWith(".gif")

    if (ImageServerSwitch.isSwitchedOn && isSupportedImage)
      if (ParameterlessImagesSwitch.isSwitchedOn) {
        s"$imageHost${imageType.resizeString}${uri.getPath}"
      } else {
        s"$imageHost${uri.getPath}?${imageType.resizeString}"
      }
    else
      url
  }

  object Imager extends Profile(None, None) {
    override def resizeString = if (ParameterlessImagesSwitch.isSwitchedOn) {
      "/w-{width}/h--/q-95"
    } else {
      s"width={width}&height=-&quality=$compression"
    }
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

object SeoOptimisedContentImage extends Profile(width = Some(460)) {
  override def bestFor(image: ImageContainer): Option[String] = if (SeoOptimisedContentImageSwitch.isSwitchedOn){
    elementFor(image).filter(i => this.width.exists(_ == i.width)).flatMap(_.url).orElse(
      super.bestFor(image)
    )
  } else {
    super.bestFor(image)
  }
}

