package model

import com.gu.openplatform.contentapi.model.{Element => ApiElement}

trait Element {
  def delegate: ApiElement
  lazy val index: Int = delegate.galleryIndex.getOrElse(0)
  lazy val id: String = delegate.id
}

object Element {
  def apply(theDelegate: ApiElement): Element = {
    theDelegate.elementType match {
      case "image" => new ImageElement(theDelegate)
      case "video" => new VideoElement(theDelegate)
      case _ => new Element{
        lazy val delegate = theDelegate
      }
    }
  }
}

trait ImageContainer extends Element {


  // this is the absolute definition of a main picture, until the content Api changes, there is no other
  lazy val isMain = delegate.relation == "main"


  lazy val imageCrops: Seq[ImageAsset] = delegate.assets.filter(_.assetType == "image").map(ImageAsset(_,index)).
                                           sortBy(-_.width)

  // The image crop with the largest width.
  lazy val largestImage: Option[ImageAsset] = imageCrops.headOption
}

object ImageContainer {
  def apply(crops: Seq[ImageAsset], theDelegate: ApiElement) = new ImageContainer {
    def delegate: ApiElement = theDelegate
    override lazy val imageCrops = crops
  }
}


trait VideoContainer extends Element {

  lazy val videoAssets: List[VideoAsset] = delegate.assets.filter(_.assetType == "video").map(VideoAsset(_)).
                                            sortBy(-_.width)

  lazy val largestVideo: Option[VideoAsset] = videoAssets.headOption
}

class ImageElement(val delegate: ApiElement) extends Element with ImageContainer
class VideoElement(val delegate: ApiElement) extends Element with ImageContainer with VideoContainer
