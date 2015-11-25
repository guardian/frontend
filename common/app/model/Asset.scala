package model

import com.gu.contentapi.client.model.Asset
import views.support.{Orientation, Naked, ImgSrc}

case class ImageAsset(delegate: Asset, index: Int) {
  private lazy val fields: Map[String, String] = delegate.typeData

  lazy val mediaType: String = delegate.`type`
  lazy val mimeType: Option[String] = delegate.mimeType

  lazy val url: Option[String] = delegate.file
  lazy val path: Option[String] = url.map(ImgSrc(_, Naked))

  lazy val thumbnail: Option[String] = fields.get("thumbnail")
  lazy val thumbnailPath: Option[String] = thumbnail.map(ImgSrc(_, Naked))

  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(1)
  lazy val height: Int = fields.get("height").map(_.toInt).getOrElse(1)
  lazy val ratio: Int = width/height
  lazy val role: Option[String] = fields.get("role")
  lazy val orientation: Orientation = Orientation.fromDimensions(width, height)

  lazy val caption: Option[String] = fields.get("caption")
  lazy val altText: Option[String] = fields.get("altText")
  lazy val mediaId: Option[String] = fields.get("mediaId")

  lazy val source: Option[String] = fields.get("source")
  lazy val photographer: Option[String] = fields.get("photographer")
  lazy val credit: Option[String] = fields.get("credit")
  lazy val displayCredit: Boolean = fields.get("displayCredit").contains("true")
  lazy val isMaster: Boolean = fields.get("isMaster").contains("true")

  def showCaption = caption.exists(_.trim.nonEmpty) || (displayCredit && credit.nonEmpty)

  lazy val creditEndsWithCaption = (for {
    credit <- credit
    caption <- caption
  } yield caption.endsWith(credit)).getOrElse(false)
}

case class VideoAsset(private val delegate: Asset, image: Option[ImageContainer]) {

  private lazy val fields: Map[String,String] = delegate.typeData

  lazy val url: Option[String] = delegate.file
  lazy val mimeType: Option[String] = delegate.mimeType
  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(0)
  lazy val height: Int = fields.get("height").map(_.toInt).getOrElse(0)
  lazy val encoding: Option[Encoding] = {
    (url, mimeType) match {
      case (Some(url), Some(mimeType)) => Some(Encoding(url, mimeType))
      case _ => None
    }
  }

  // The video duration in seconds
  lazy val duration: Int = fields.get("durationSeconds").getOrElse("0").toInt +
                           (fields.get("durationMinutes").getOrElse("0").toInt * 60)
  lazy val blockVideoAds: Boolean = fields.get("blockAds").exists(_.toBoolean)

  lazy val source: Option[String] = fields.get("source")
  lazy val embeddable: Boolean = fields.get("embeddable").exists(_.toBoolean)
  lazy val caption: Option[String] = fields.get("caption")
}

case class AudioAsset(private val delegate: Asset) {

  private lazy val fields: Map[String,String] = delegate.typeData

  lazy val url: Option[String] = delegate.file
  lazy val mimeType: Option[String] = delegate.mimeType

  // The audio duration in seconds
  lazy val duration: Int = fields.get("durationSeconds").getOrElse("0").toInt +
    (fields.get("durationMinutes").getOrElse("0").toInt * 60)
}

case class EmbedAsset(private val delegate: Asset) {

  private lazy val fields: Map[String,String] = delegate.typeData

  lazy val url: Option[String] = delegate.file
  lazy val iframeUrl: Option[String] = fields.get("iframeUrl")
  lazy val scriptName: Option[String] = fields.get("scriptName")
  lazy val source: Option[String] = fields.get("source")
  lazy val scriptUrl: Option[String] = fields.get("scriptUrl")
  lazy val caption: Option[String] = fields.get("caption")
  lazy val html: Option[String] = fields.get("html")
  lazy val embedType: Option[String] = fields.get("embedType")
  lazy val role: Option[String] = fields.get("role")
}
