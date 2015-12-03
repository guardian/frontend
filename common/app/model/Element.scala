package model

import org.joda.time.Duration
import com.gu.contentapi.client.model.{Element => ApiElement}
import org.apache.commons.math3.fraction.Fraction

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
    theDelegate.`type` match {
      case "image" => new ImageElement(theDelegate, elementIndex)
      case "video" => new VideoElement(theDelegate, elementIndex)
      case "audio" => new AudioElement(theDelegate, elementIndex)
      case "embed" => new EmbedElement(theDelegate, elementIndex)
      case _ => new Element{
        lazy val delegate = theDelegate
        lazy val index = elementIndex
      }
    }
  }
}

trait ImageContainer extends Element {

  private val allImages: Seq[ImageAsset] = delegate.assets.filter(_.`type` == "image").map(ImageAsset(_,index)).sortBy(-_.width)

  lazy val imageCrops: Seq[ImageAsset] = allImages.filterNot(_.isMaster)

  lazy val masterImage: Option[ImageAsset] = allImages.find(_.isMaster)

  // The image crop with the largest width.
  lazy val largestImage: Option[ImageAsset] = masterImage.orElse(imageCrops.sortBy(-_.width).headOption)
  lazy val largestImageUrl: Option[String] = largestImage.flatMap(_.url)

  // all landscape images get 4:3 aspect autocrops generated at widths of 1024 and 2048. portrait images are never
  // auto-cropped.. this is a temporary solution until the new media service is in use and we can properly
  // distinguish crops by their intended usage
  lazy val largestEditorialCrop: Option[ImageAsset] = {
    val autoCropRatio = new Fraction(4,3)
    // if all crops are 4:3 then we can assume the original was 4:3 as we only generate 4:3 auto-crops
    // otherwise the original must have been a different aspect ratio
    if (imageCrops.exists(img => new Fraction(img.width, img.height) != autoCropRatio)) {
      imageCrops.find{img => !(new Fraction(img.width, img.height) == autoCropRatio && (img.width == 1024 || img.width == 2048))}
    } else {
      largestImage
    }
  }
}

object ImageContainer {
  def apply(crops: Seq[ImageAsset], theDelegate: ApiElement, imageIndex: Int) = new ImageContainer {
    override def delegate: ApiElement = theDelegate
    override def index: Int = imageIndex
    override lazy val imageCrops = crops
  }
}

trait VideoContainer extends Element {

  protected implicit val ordering = EncodingOrdering

  lazy val videoAssets: List[VideoAsset] = {
    val images = delegate.assets.filter(_.`type` == "image").zipWithIndex.map{ case (asset, index) =>
      ImageAsset(asset, index)
    }

    val container = images.headOption.map(img => ImageContainer(images, delegate, img.index))

    delegate.assets.filter(_.`type` == "video").map( v => VideoAsset(v, container)).sortBy(-_.width)
  }

  lazy val blockVideoAds = videoAssets.exists(_.blockVideoAds)

  lazy val encodings: Seq[Encoding] = {
    videoAssets.toList.collect {
      case video: VideoAsset => video.encoding
    }.flatten.sorted
  }
  lazy val duration: Int = videoAssets.headOption.map(_.duration).getOrElse(0)
  lazy val ISOduration: String = new Duration(duration*1000.toLong).toString()
  lazy val height: String = videoAssets.headOption.map(_.height).getOrElse(0).toString
  lazy val width: String = videoAssets.headOption.map(_.width).getOrElse(0).toString

  lazy val largestVideo: Option[VideoAsset] = videoAssets.headOption

  lazy val source: Option[String] = videoAssets.headOption.flatMap(_.source)
  lazy val embeddable: Boolean = videoAssets.headOption.map(_.embeddable).getOrElse(false)
  lazy val caption: Option[String] = largestVideo.flatMap(_.caption)
}

trait AudioContainer extends Element {
  protected implicit val ordering = EncodingOrdering
  lazy val audioAssets: List[AudioAsset] = delegate.assets.filter(_.`type` == "audio").map( v => AudioAsset(v))
  lazy val duration: Int = audioAssets.headOption.map(_.duration).getOrElse(0)
  lazy val encodings: Seq[Encoding] = {
    audioAssets.toList.collect {
      case audio: AudioAsset => Encoding(audio.url.getOrElse(""), audio.mimeType.getOrElse(""))
    }.sorted
  }
}

trait EmbedContainer extends Element {

   lazy val embedAssets: Seq[EmbedAsset] = delegate.assets.filter(_.`type` == "embed").map(EmbedAsset(_))
}

class ImageElement(val delegate: ApiElement, val index: Int) extends Element with ImageContainer
class VideoElement(val delegate: ApiElement, val index: Int) extends Element with ImageContainer with VideoContainer
class AudioElement(val delegate: ApiElement, val index: Int) extends Element with ImageContainer with AudioContainer
class EmbedElement(val delegate: ApiElement, val index: Int) extends Element with EmbedContainer
