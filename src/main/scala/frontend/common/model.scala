package frontend.common

import com.gu.openplatform.contentapi.model.{ MediaAsset => ApiMedia, Content => ApiContent, Tag => ApiTag }
import math.abs
import org.joda.time.DateTime

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
  lazy val id: String = tag.id
  lazy val url: String = RelativeUrl(tag)
  lazy val name: String = tag.webTitle
  lazy val tagType: String = tag.`type`
}

trait Tags {

  def tags: Seq[Tag] = Nil

  private def tagsOfType(tagType: String): Seq[Tag] = tags.filter(_.tagType == tagType)

  lazy val keywords = tagsOfType("keyword")
  lazy val contributors = tagsOfType("contributor")
  lazy val series = tagsOfType("series")
  lazy val blogs = tagsOfType("blog")
  lazy val tones = tagsOfType("tone")
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

class Content(content: ApiContent, val relatedContent: Seq[Trail] = Nil) extends Tags with Images {

  override lazy val tags: Seq[Tag] = content.tags map { Tag(_) }
  override lazy val images: Seq[Image] = content.mediaAssets.filter { _.`type` == "picture" } map { Image(_) }

  lazy val trailText: Option[String] = content.safeFields.get("trailText")
  lazy val id: String = content.id
  lazy val section: String = content.sectionId.getOrElse("")
  lazy val publication: String = content.safeFields.get("publication").getOrElse("")
  lazy val webPublicationDate: DateTime = content.webPublicationDate
  lazy val shortUrl: String = content.safeFields("shortUrl")
  lazy val headline: String = content.safeFields("headline")

  // Meta Data used by plugins on the page
  // people (including 3rd parties) rely on the names of these things, think carefully before changing them
  def metaData = Map[String, Any](
    "keywords" -> keywords.map { _.name }.mkString(","),
    "description" -> trailText.getOrElse(""),
    "page-id" -> id,
    "section" -> section,
    "publication" -> publication,
    "tag-ids" -> tags.map(_.id).mkString(","),
    "author" -> contributors.map(_.name).mkString(","),
    "tones" -> tones.map(_.name).mkString(","),
    "series" -> series.map(_.name).mkString(","),
    "blogs" -> blogs.map(_.name).mkString(","),
    "web-publication-date" -> webPublicationDate,
    "short-url" -> shortUrl,
    "api-url" -> content.apiUrl,
    "web-title" -> content.webTitle,
    "byline" -> content.safeFields.get("byline").getOrElse(""),
    "commentable" -> content.safeFields.get("commentable").getOrElse("false")
  )
}
