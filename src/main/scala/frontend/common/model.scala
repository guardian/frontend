package frontend.common

import com.gu.openplatform.contentapi.model.{ MediaAsset => ApiMedia, Content => ApiContent, Tag => ApiTag }
import math.abs

trait Trail extends Images {
  def linkText: String
  def url: String
  def images: Seq[Image] = Nil
}

object Trail {
  def apply(c: ApiContent): Trail = new Trail {
    override lazy val url = RelativeUrl(c)
    override lazy val linkText = c.webTitle
    override lazy val images = c.mediaAssets.filter(_.`type` == "picture").map(Image(_))
  }
  def apply(t: ApiTag): Trail = new Trail {
    override lazy val url = RelativeUrl(t)
    override lazy val linkText = t.webTitle
  }
}

case class Tag(private val tag: ApiTag) {
  lazy val url = RelativeUrl(tag)
  lazy val name = tag.webTitle
}

case class Image(private val media: ApiMedia) {
  private val fields = media.fields.getOrElse(Map.empty[String, String])

  lazy val mediaType: String = media.`type`
  lazy val rel: String = media.rel
  lazy val url: Option[String] = media.file
  lazy val caption: Option[String] = fields.get("caption")
  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(0)
}

trait Images {
  def images: Seq[Image]

  def imageOfWidth(desiredWidth: Int, tolerance: Int = 0): Option[Image] = {
    val validWidths = (desiredWidth - tolerance) to (desiredWidth + tolerance)
    val imagesInWidthRange = images.filter(image => validWidths contains image.width)
    imagesInWidthRange.sortBy(image => abs(desiredWidth - image.width)).headOption
  }
}
