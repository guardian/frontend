package model

import com.gu.openplatform.contentapi.model.{Element => ApiElement}

trait Element {
  def delegate: ApiElement
  def index: Int
  lazy val id: String = delegate.id

  lazy val isMain = delegate.relation == "main"
  lazy val isBody = delegate.relation == "body"
  lazy val isGallery = delegate.relation == "gallery"
  lazy val isThumbnail = delegate.relation == "thumbnail"
}

object Element {
  def apply(theDelegate: ApiElement, elementIndex: Int): Element = {
    theDelegate.elementType match {
      case "image" => new ImageElement(theDelegate, elementIndex)
      case "video" => new VideoElement(theDelegate, elementIndex)
      case "embed" => new EmbedElement(theDelegate, elementIndex)
      case _ => new Element{
        lazy val delegate = theDelegate
        lazy val index = elementIndex
      }
    }
  }
}

trait ImageContainer extends Element {

  lazy val imageCrops: Seq[ImageAsset] = delegate.assets.filter(_.assetType == "image").map(ImageAsset(_,index)).
                                           sortBy(-_.width)

  // The image crop with the largest width.
  lazy val largestImage: Option[ImageAsset] = imageCrops.headOption
}

object ImageContainer {
  def apply(crops: Seq[ImageAsset], theDelegate: ApiElement, imageIndex: Int) = new ImageContainer {
    override def delegate: ApiElement = theDelegate
    override def index: Int = imageIndex
    override lazy val imageCrops = crops
  }
}

trait VideoContainer extends Element {

  lazy val videoAssets: List[VideoAsset] = {

    val images = delegate.assets.filter(_.assetType == "image").zipWithIndex.map{ case (asset, index) =>
      ImageAsset(asset, index)
    }

    val container = images.headOption.map(img => ImageContainer(images, delegate, img.index))

    delegate.assets.filter(_.assetType == "video").map( v => VideoAsset(v, container)).sortBy(-_.width)
  }

  lazy val largestVideo: Option[VideoAsset] = videoAssets.headOption
}

trait EmbedContainer extends Element {

   lazy val embedAssets: Seq[EmbedAsset] = delegate.assets.filter(_.assetType == "embed").map(EmbedAsset(_))
}

class ImageElement(val delegate: ApiElement, val index: Int) extends Element with ImageContainer
class VideoElement(val delegate: ApiElement, val index: Int) extends Element with ImageContainer with VideoContainer
class EmbedElement(val delegate: ApiElement, val index: Int) extends Element with EmbedContainer
