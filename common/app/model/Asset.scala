package model

import com.gu.contentapi.client.model.Asset
import views.support.{Orientation, Naked, ImgSrc}

object ImageAsset {
  def make(asset: Asset, index: Int): ImageAsset = {
    ImageAsset(
      index = index,
      fields = asset.typeData,
      mediaType = asset.`type`,
      mimeType = asset.mimeType,
      url = asset.file )
  }
}

case class ImageAsset(
  index: Int,
  fields: Map[String, String],
  mediaType: String,
  mimeType: Option[String],
  url: Option[String]) {

  val path: Option[String] = url.map(ImgSrc(_, Naked))

  val thumbnail: Option[String] = fields.get("thumbnail")
  val thumbnailPath: Option[String] = thumbnail.map(ImgSrc(_, Naked))

  val width: Int = fields.get("width").map(_.toInt).getOrElse(1)
  val height: Int = fields.get("height").map(_.toInt).getOrElse(1)
  lazy val ratio: Int = width/height
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
      fields = asset.typeData,
      mimeType = asset.mimeType,
      url = asset.file )
  }
}

case class VideoAsset(
  fields: Map[String,String],
  url: Option[String],
  mimeType: Option[String]) {

  val width: Int = fields.get("width").map(_.toInt).getOrElse(0)
  val height: Int = fields.get("height").map(_.toInt).getOrElse(0)
  val encoding: Option[Encoding] = {
    (url, mimeType) match {
      case (Some(url), Some(mimeType)) => Some(Encoding(url, mimeType))
      case _ => None
    }
  }

  // The video duration in seconds
  val duration: Int = fields.get("durationSeconds").getOrElse("0").toInt +
                           (fields.get("durationMinutes").getOrElse("0").toInt * 60)
  val blockVideoAds: Boolean = fields.get("blockAds").exists(_.toBoolean)

  val source: Option[String] = fields.get("source")
  val embeddable: Boolean = fields.get("embeddable").exists(_.toBoolean)
  val caption: Option[String] = fields.get("caption")
}

object AudioAsset {
  def make(asset: Asset): AudioAsset = {
    AudioAsset(
      fields = asset.typeData,
      mimeType = asset.mimeType,
      url = asset.file )
  }
}

case class AudioAsset(
  fields: Map[String,String],
  url: Option[String],
  mimeType: Option[String]) {

  // The audio duration in seconds
  val duration: Int = fields.get("durationSeconds").getOrElse("0").toInt +
    (fields.get("durationMinutes").getOrElse("0").toInt * 60)
}

object EmbedAsset {
  def make(asset: Asset): EmbedAsset = {
    EmbedAsset(
      fields = asset.typeData,
      url = asset.file )
  }
}

case class EmbedAsset(
  fields: Map[String,String],
  url: Option[String]) {

  val iframeUrl: Option[String] = fields.get("iframeUrl")
  val scriptName: Option[String] = fields.get("scriptName")
  val source: Option[String] = fields.get("source")
  val scriptUrl: Option[String] = fields.get("scriptUrl")
  val caption: Option[String] = fields.get("caption")
  val html: Option[String] = fields.get("html")
  val embedType: Option[String] = fields.get("embedType")
  val role: Option[String] = fields.get("role")
}
