package model

import com.gu.openplatform.contentapi.model.Asset
import views.support.{Naked, ImgSrc}

case class ImageAsset(private val delegate: Asset, val index: Int) {

  private lazy val fields: Map[String,String] = delegate.typeData

  lazy val mediaType: String = delegate.`type`

  lazy val url: Option[String] = delegate.file
  lazy val path: Option[String] = url.map(ImgSrc(_, Naked))

  lazy val thumbnail: Option[String] = fields.get("thumbnail")
  lazy val thumbnailPath: Option[String] = thumbnail.map(ImgSrc(_, Naked))

  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(0)
  lazy val height: Int = fields.get("height").map(_.toInt).getOrElse(0)

  lazy val caption: Option[String] = fields.get("caption")
  lazy val altText: Option[String] = fields.get("altText")

  lazy val source: Option[String] = fields.get("source")
  lazy val photographer: Option[String] = fields.get("photographer")
  lazy val credit: Option[String] = fields.get("credit")

  lazy val aspectRatio: Double = width.toDouble / height.toDouble
}

case class VideoAsset(private val delegate: Asset) {

  private lazy val fields: Map[String,String] = delegate.typeData

  lazy val url: Option[String] = delegate.file
  lazy val mimeType: Option[String] = delegate.mimeType
  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(0)
  lazy val height: Int = fields.get("height").map(_.toInt).getOrElse(0)

  // The video duration in seconds
  lazy val duration: Int = fields.get("durationSeconds").getOrElse("0").toInt +
                           (fields.get("durationMinutes").getOrElse("0").toInt * 60)
  lazy val blockAds: Boolean = fields.get("blockAds").exists(_.toBoolean)

  lazy val source: Option[String] = fields.get("source")

  lazy val stillImageUrl: Option[String] = fields.get("stillImageUrl")
}
