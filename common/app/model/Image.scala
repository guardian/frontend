package model

import com.gu.openplatform.contentapi.model.Asset
import views.support.{Naked, ImgSrc}

case class Image(private val delegate: Asset, val index: Int) {

  private lazy val fields: Map[String,String] = delegate.typeData

  lazy val mediaType: String = delegate.`type`

  lazy val url: Option[String] = delegate.file
  lazy val path: Option[String] = delegate.file.map(ImgSrc(_, Naked))

  lazy val thumbnail: Option[String] = fields.get("thumbnail")
  
  lazy val thumbnailPath: Option[String] = fields.get("thumbnail").map(ImgSrc(_, Naked))

  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(0)
  lazy val height: Int = fields.get("height").map(_.toInt).getOrElse(0)

  lazy val caption: Option[String] = fields.get("caption")
  lazy val altText: Option[String] = fields.get("altText")

  lazy val source: Option[String] = fields.get("source")
  lazy val photographer: Option[String] = fields.get("photographer")
  lazy val credit: Option[String] = fields.get("credit")

  lazy val aspectRatio: Double = width.toDouble / height.toDouble
}
