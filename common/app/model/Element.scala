package model

import org.joda.time.Duration
import com.gu.contentapi.client.model.v1.{Element => ApiElement}
import org.apache.commons.math3.fraction.Fraction

object ElementProperties {
  def make(capiElement: ApiElement, index: Int): ElementProperties = {
    ElementProperties(
      index = index,
      id = capiElement.id,
      isMain = capiElement.relation == "main",
      isBody = capiElement.relation == "body",
      isGallery = capiElement.relation == "gallery",
      isThumbnail = capiElement.relation == "thumbnail"
    )
  }
}
final case class ElementProperties (
  index: Int,
  id: String,
  isMain: Boolean,
  isBody: Boolean,
  isGallery: Boolean,
  isThumbnail: Boolean
)

object Element {
  def apply(capiElement: ApiElement, elementIndex: Int): Element = {
    val properties = ElementProperties.make(capiElement, elementIndex)
    val images = ImageMedia.make(capiElement, properties)

    capiElement.`type`.name match {
      case "image" => ImageElement(properties, images)
      case "video" => VideoElement(properties, images, VideoMedia.make(capiElement))
      case "audio" => AudioElement(properties, images, AudioMedia.make(capiElement))
      case "embed" => EmbedElement(properties, images, EmbedMedia.make(capiElement))
      case _ => DefaultElement(properties, images)
    }
  }
}

sealed trait Element {
  def properties: ElementProperties
  def images: ImageMedia
}

object ImageMedia {
  def make(capiElement: ApiElement, properties: ElementProperties): ImageMedia = ImageMedia(
    allImages = capiElement.assets.filter(_.`type` == "image").map(ImageAsset.make(_,properties.index)).sortBy(-_.width)
  )
  def make(crops: Seq[ImageAsset]): ImageMedia = ImageMedia(
    allImages = crops
  )
}
final case class ImageMedia(allImages: Seq[ImageAsset]) {

  lazy val imageCrops: Seq[ImageAsset] = allImages.filterNot(_.isMaster)
  lazy val masterImage: Option[ImageAsset] = allImages.find(_.isMaster)

  // The image crop with the largest width.
  lazy val largestImage: Option[ImageAsset] = masterImage.orElse(imageCrops.sortBy(-_.width).headOption)
  lazy val largestImageUrl: Option[String] = largestImage.flatMap(_.url)

  // all landscape images get 4:3 aspect autocrops generated at widths of 1024 and 2048. portrait images are never
  // auto-cropped.. this is a temporary solution until the new media service is in use and we can properly
  // distinguish crops by their intended usage
  lazy val largestEditorialCrop: Option[ImageAsset] = {
    val autoCropRatio = new Fraction(4, 3)
    // if all crops are 4:3 then we can assume the original was 4:3 as we only generate 4:3 auto-crops
    // otherwise the original must have been a different aspect ratio
    if (imageCrops.exists(img => new Fraction(img.width, img.height) != autoCropRatio)) {
      imageCrops.find { img => !(new Fraction(img.width, img.height) == autoCropRatio && (img.width == 1024 || img.width == 2048)) }
    } else {
      largestImage
    }
  }
}

object VideoMedia {
  def make(capiElement: ApiElement): VideoMedia = VideoMedia(
    videoAssets = capiElement.assets.filter(_.`type` == "video").map(VideoAsset.make).sortBy(-_.width).toList
  )
}
final case class VideoMedia(videoAssets: List[VideoAsset]) {
  private implicit val ordering = EncodingOrdering

  val blockVideoAds = videoAssets.exists(_.blockVideoAds)

  val encodings: Seq[Encoding] = {
    videoAssets.toList.collect {
      case video: VideoAsset => video.encoding
    }.flatten.sorted
  }
  val duration: Int = videoAssets.headOption.map(_.duration).getOrElse(0)
  val ISOduration: String = new Duration(duration*1000.toLong).toString()
  val height: String = videoAssets.headOption.map(_.height).getOrElse(0).toString
  val width: String = videoAssets.headOption.map(_.width).getOrElse(0).toString

  val largestVideo: Option[VideoAsset] = videoAssets.headOption

  val source: Option[String] = videoAssets.headOption.flatMap(_.source)
  val embeddable: Boolean = videoAssets.headOption.map(_.embeddable).getOrElse(false)
  val caption: Option[String] = largestVideo.flatMap(_.caption)
}

object AudioMedia {
  def make(capiElement: ApiElement): AudioMedia = AudioMedia(
    audioAssets = capiElement.assets.filter(_.`type` == "audio").map(AudioAsset.make).toList
  )
}
final case class AudioMedia(audioAssets: List[AudioAsset]) {
  private implicit val ordering = EncodingOrdering

  val duration: Int = audioAssets.headOption.map(_.duration).getOrElse(0)
  val encodings: Seq[Encoding] = {
    audioAssets.toList.collect {
      case audio: AudioAsset => Encoding(audio.url.getOrElse(""), audio.mimeType.getOrElse(""))
    }.sorted
  }
}

object EmbedMedia {
  def make(capiElement: ApiElement): EmbedMedia = EmbedMedia(
    embedAssets = capiElement.assets.filter(_.`type` == "embed").map(EmbedAsset.make)
  )
}
final case class EmbedMedia(embedAssets: Seq[EmbedAsset])

final case class ImageElement(
  override val properties: ElementProperties,
  override val images: ImageMedia) extends Element

final case class VideoElement(
  override val properties: ElementProperties,
  override val images: ImageMedia,
  videos: VideoMedia) extends Element

final case class AudioElement(
  override val properties: ElementProperties,
  override val images: ImageMedia,
  audio: AudioMedia) extends Element

final case class EmbedElement(
  override val properties: ElementProperties,
  override val images: ImageMedia,
  embeds: EmbedMedia) extends Element

final case class DefaultElement(
  override val properties: ElementProperties,
  override val images: ImageMedia) extends Element
