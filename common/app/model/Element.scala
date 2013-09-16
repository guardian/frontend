package model

import com.gu.openplatform.contentapi.model.{Element => ApiElement}

class Element protected (val delegate: ApiElement, val index: Int)

object Element {
  def apply(delegate: ApiElement, index: Int): Element = {
    delegate.elementType match {
      case "image" => new ImageElement(delegate, index)
      case "video" => new VideoElement(delegate, index)
      case _ => new Element(delegate, index)
    }
  }
}

trait ImageContainer {
  self: Element =>
  lazy val imageCrops: List[ImageAsset] = delegate.assets.filter(_.assetType == "image").map(ImageAsset(_,index)).
                                      sortBy(-_.width)

  // The image crop with the largest width.
  lazy val largestImage : Option[ImageAsset] = imageCrops.headOption
}

trait VideoContainer {
  self: Element =>
  lazy val videoAssets: List[VideoAsset] = delegate.assets.filter(_.assetType == "video").map(VideoAsset(_))
}

class ImageElement(delegate: ApiElement, index: Int) extends Element(delegate, index) with ImageContainer
{
  // Image elements only contain images.
}

class VideoElement(delegate: ApiElement, index: Int) extends Element(delegate, index) with ImageContainer with VideoContainer
{
  // Video elements can have both images and videos.
}
