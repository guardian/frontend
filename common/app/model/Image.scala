package model.pressed

import com.gu.facia.api.{models => fapi}

sealed trait Image

object Image {
  def make(image: fapi.FaciaImage): Image =
    image match {
      case cutout: fapi.Cutout            => Cutout.make(cutout)
      case replace: fapi.Replace          => Replace.make(replace)
      case slideshow: fapi.ImageSlideshow => ImageSlideshow.make(slideshow)
    }
}

final case class Cutout(imageSrc: String, imageSrcWidth: Option[String], imageSrcHeight: Option[String]) extends Image

object Cutout {
  def make(cutout: fapi.Cutout): Cutout =
    Cutout(imageSrc = cutout.imageSrc, imageSrcHeight = cutout.imageSrcHeight, imageSrcWidth = cutout.imageSrcWidth)
}

final case class Replace(imageSrc: String, imageSrcWidth: String, imageSrcHeight: String, imageCaption: Option[String])
    extends Image

object Replace {
  def make(replace: fapi.Replace): Replace =
    Replace(
      imageSrc = replace.imageSrc,
      imageSrcHeight = replace.imageSrcHeight,
      imageSrcWidth = replace.imageSrcWidth,
      imageCaption = replace.imageCaption,
    )

}

final case class ImageSlideshow(assets: List[Replace]) extends Image

object ImageSlideshow {
  def make(slideshow: fapi.ImageSlideshow): ImageSlideshow =
    ImageSlideshow(
      assets = slideshow.assets.map(Replace.make),
    )
}
