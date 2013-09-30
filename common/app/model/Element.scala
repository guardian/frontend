package model

import com.gu.openplatform.contentapi.model.{Element => ApiElement}

class Element protected (val delegate: ApiElement) {
  lazy val index: Int = delegate.galleryIndex.getOrElse(0)
}

object Element {
  def apply(delegate: ApiElement): Element = {
    delegate.elementType match {
      case "image" => new ImageElement(delegate)
      case "video" => new VideoElement(delegate)
      case _ => new Element(delegate)
    }
  }
}

trait ImageContainer {
  self: Element =>
  lazy val imageCrops: List[ImageAsset] = delegate.assets.filter(_.assetType == "image").map(ImageAsset(_,index)).
                                      sortBy(-_.width)

  // The image crop with the largest width.
  lazy val largestImage: Option[ImageAsset] = imageCrops.headOption
}

trait VideoContainer {
  self: Element =>
  lazy val videoAssets: List[VideoAsset] = delegate.assets.filter(_.assetType == "video").map(VideoAsset(_))
}

class ImageElement(delegate: ApiElement) extends Element(delegate) with ImageContainer
{
  // Image elements only contain images.
}

class VideoElement(delegate: ApiElement) extends Element(delegate) with ImageContainer with VideoContainer
{
  // Video elements can have both images and videos.
}
