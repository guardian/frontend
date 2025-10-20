package model

import com.gu.contentapi.client.model.v1.{Asset, AssetType, CartoonImage, ProductImage, AudioElementFields}
import play.api.libs.json.{Json, Writes}
import views.support.{ImgSrc, Naked, Orientation}

object Helpers {
  def assetFieldsToMap(asset: Asset): Map[String, String] =
    Map(
      "altText" -> asset.typeData.flatMap(_.altText),
      "blockAds" -> asset.typeData.flatMap(_.blockAds).map(_.toString),
      "caption" -> asset.typeData.flatMap(_.caption),
      "credit" -> asset.typeData.flatMap(_.credit),
      "displayCredit" -> asset.typeData.flatMap(_.displayCredit).map(_.toString),
      "durationMinutes" -> asset.typeData.flatMap(_.durationMinutes).map(_.toString),
      "durationSeconds" -> asset.typeData.flatMap(_.durationSeconds).map(_.toString),
      "embeddable" -> asset.typeData.flatMap(_.embeddable).map(_.toString),
      "height" -> asset.typeData.flatMap(_.height).map(_.toString),
      "isMaster" -> asset.typeData.flatMap(_.isMaster).map(_.toString),
      "mediaId" -> asset.typeData.flatMap(_.mediaId),
      "photographer" -> asset.typeData.flatMap(_.photographer),
      "role" -> asset.typeData.flatMap(_.role),
      "source" -> asset.typeData.flatMap(_.source),
      "thumbnail" -> asset.typeData.flatMap(_.thumbnailUrl),
      "width" -> asset.typeData.flatMap(_.width).map(_.toString),
      "iframeUrl" -> asset.typeData.flatMap(_.iframeUrl),
      "scriptUrl" -> asset.typeData.flatMap(_.scriptUrl),
      "scriptName" -> asset.typeData.flatMap(_.scriptName),
      "html" -> asset.typeData.flatMap(_.html),
      "embedType" -> asset.typeData.flatMap(_.embedType),
      "aspectRatio" -> asset.typeData.flatMap(_.aspectRatio),
    ).collect { case (k, Some(v)) => (k, v) }

  def audioElementFieldsToMap(audioElementFields: AudioElementFields): Map[String, String] =
    Map(
      "durationMinutes" -> audioElementFields.durationMinutes.map(_.toString),
      "durationSeconds" -> audioElementFields.durationSeconds.map(_.toString),
      "explicit" -> audioElementFields.explicit.map(_.toString),
      "source" -> audioElementFields.source,
    ).collect { case (k, Some(v)) => (k, v) }
}

object ImageAsset {
  def make(asset: Asset, index: Int): ImageAsset = {
    ImageAsset(
      index = index,
      fields = Helpers.assetFieldsToMap(asset),
      mediaType = asset.`type`.name,
      mimeType = asset.mimeType,
      url = asset.typeData.flatMap(_.secureFile).orElse(asset.file),
    )
  }
  def make(cartoonImage: CartoonImage, index: Int): ImageAsset = {
    ImageAsset(
      index = index,
      fields = Map(
        "height" -> cartoonImage.height.map(_.toString),
        "width" -> cartoonImage.width.map(_.toString),
      ).collect { case (k, Some(v)) => (k, v) },
      mediaType = AssetType.Cartoon.name,
      mimeType = Some(cartoonImage.mimeType),
      url = Some(cartoonImage.file),
    )
  }
  implicit val imageAssetWrites: Writes[ImageAsset] = Json.writes[ImageAsset]
}

/** ImageAsset is the main internal model for images, and is generated directly from CAPI (atom) data.
  */
case class ImageAsset(
    // Order (zero indexed) if image is in a set.
    index: Int = 0,
    // Image metadata, such as width, height, role. Use the class helper methods rather than accessing directly.
    fields: Map[String, String],
    mediaType: String,
    mimeType: Option[String],
    url: Option[String],
) {

  lazy val path: Option[String] = url.map(ImgSrc(_, Naked))

  val thumbnail: Option[String] = fields.get("thumbnail")
  val thumbnailPath: Option[String] = thumbnail.map(ImgSrc(_, Naked))

  val width: Int = fields.get("width").map(_.toInt).getOrElse(1)
  val height: Int = fields.get("height").map(_.toInt).getOrElse(1)
  lazy val ratioWholeNumber: Int = width / height
  lazy val ratioDouble: Double = width.toDouble / height
  val role: Option[String] = fields.get("role")
  val orientation: Orientation = Orientation.fromDimensions(width, height)

  val caption: Option[String] = fields.get("caption")
  val altText: Option[String] = fields.get("altText")
  val mediaId: Option[String] = fields.get("mediaId")

  val source: Option[String] = fields.get("source")
  val photographer: Option[String] = fields.get("photographer")
  val credit: Option[String] = fields.get("credit")
  val displayCredit: Boolean = fields.get("displayCredit").contains("true")
  val isMaster: Boolean = fields.get("isMaster").contains("true")

  val showCaption: Boolean = caption.exists(_.trim.nonEmpty) || (displayCredit && credit.nonEmpty)

  val creditEndsWithCaption = (for {
    credit <- credit
    caption <- caption
  } yield caption.endsWith(credit)).getOrElse(false)
}

object VideoAsset {
  def make(asset: Asset): VideoAsset = {
    VideoAsset(
      fields = Helpers.assetFieldsToMap(asset),
      mimeType = asset.mimeType,
      url = asset.typeData
        .flatMap {
          // FIXME: Remove this once the multimedia.guardianapis are available over https
          case asset if !asset.secureFile.exists(s => s.startsWith("https://multimedia.guardianapis.com")) =>
            asset.secureFile
          case _ => None
        }
        .orElse(asset.file),
    )
  }
  implicit val videoAssetWrites: Writes[VideoAsset] = Json.writes[VideoAsset]
}

case class VideoAsset(fields: Map[String, String], url: Option[String], mimeType: Option[String]) {

  val width: Int = fields.get("width").map(_.toInt).getOrElse(0)
  val height: Int = fields.get("height").map(_.toInt).getOrElse(0)
  val encoding: Option[Encoding] = {
    (url, mimeType) match {
      case (Some(url), Some(mimeType)) => Some(Encoding(url, mimeType))
      case _                           => None
    }
  }

  val durationSeconds: Int = fields.getOrElse("durationSeconds", "0").toInt
  val durationMinutes: Int = fields.getOrElse("durationMinutes", "0").toInt
  // The video duration in seconds
  val duration: Int = durationSeconds + (durationMinutes * 60)
  val blockVideoAds: Boolean = fields.get("blockAds").exists(_.toBoolean)
  val source: Option[String] = fields.get("source")
  val embeddable: Boolean = fields.get("embeddable").exists(_.toBoolean)
  val caption: Option[String] = fields.get("caption")
}

object AudioAsset {
  def make(asset: Asset, audioElementFields: Option[AudioElementFields] = None): AudioAsset = {
    val fields = if (asset.typeData.isEmpty) {
      Helpers.assetFieldsToMap(asset)
    } else {
      audioElementFields.map(Helpers.audioElementFieldsToMap).getOrElse(Map.empty)
    }
    AudioAsset(
      fields = fields,
      mimeType = asset.mimeType,
      url = asset.typeData.flatMap(_.secureFile).orElse(asset.file),
    )
  }
  implicit val audioAssetWrites: Writes[AudioAsset] = Json.writes[AudioAsset]
}

case class AudioAsset(fields: Map[String, String], url: Option[String], mimeType: Option[String]) {

  // The audio duration in seconds
  val duration: Int = fields.getOrElse("durationSeconds", "0").toInt +
    (fields.getOrElse("durationMinutes", "0").toInt * 60)
}

object EmbedAsset {
  def make(asset: Asset): EmbedAsset = {
    EmbedAsset(fields = Helpers.assetFieldsToMap(asset), url = asset.typeData.flatMap(_.secureFile).orElse(asset.file))
  }
}

case class EmbedAsset(fields: Map[String, String], url: Option[String]) {

  val iframeUrl: Option[String] = fields.get("iframeUrl")
  val scriptName: Option[String] = fields.get("scriptName")
  val source: Option[String] = fields.get("source")
  val scriptUrl: Option[String] = fields.get("scriptUrl")
  val caption: Option[String] = fields.get("caption")
  val html: Option[String] = fields.get("html")
  val embedType: Option[String] = fields.get("embedType")
  val role: Option[String] = fields.get("role")
}
