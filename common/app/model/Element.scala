package model

import com.gu.openplatform.contentapi.model.{ Element => ApiElement, Asset}

class Element protected (private val delegate: ApiElement, val index: Int) {

}

object Element {
  def apply(delegate: ApiElement, index: Int): Element = {
    delegate match {
      case gallery if delegate.elementType == "image" => new ImageElement(delegate, index)
      case video if delegate.elementType =="video" => new VideoElement(delegate, index)
      case _ => new Element(delegate, index)
    }
  }
}

class ImageElement(delegate: ApiElement, index: Int) extends Element(delegate, index)
{
  lazy val imageCrops: List[Image] = delegate.assets.filter(_.assetType == "image").map(Image(_,index)).sortBy(_.width)

  // The image val is typically used when the crops list has a single image,
  // eg. gallery, a collection of single-image Elements,
  lazy val image : Option[Image] = imageCrops.headOption
}

class VideoElement(delegate: ApiElement, index: Int) extends Element(delegate, index)
{
  lazy val videoImages: List[Image] = delegate.assets.filter(_.assetType == "image").map(Image(_,index)).sortBy(_.width)

  lazy val videoAssets: List[Asset] = delegate.assets.filter(_.assetType == "video")
}
