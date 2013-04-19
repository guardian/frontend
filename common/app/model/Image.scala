package model

import com.gu.openplatform.contentapi.model.{ MediaAsset => ApiMedia }
import views.support.{Naked, ImgSrc}

case class Image(private val delegate: ApiMedia) {
  private lazy val fields = delegate.fields getOrElse Map.empty[String, String]

  lazy val mediaType: String = delegate.`type`
  lazy val rel: String = delegate.rel
  lazy val index: Int = delegate.index

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
