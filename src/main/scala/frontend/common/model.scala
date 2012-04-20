package frontend.common

import com.gu.openplatform.contentapi.model.{ MediaAsset => ApiMedia, Content => ApiContent, Tag => ApiTag }
import math.abs
import org.joda.time.DateTime

trait MetaData {
  def id: String
  def section: String
  def apiUrl: String
  def webTitle: String

  def metaData = Map[String, Any](
    "page-id" -> id,
    "section" -> section,
    "api-url" -> apiUrl,
    "web-title" -> webTitle
  )
}

trait Images {
  def images: Seq[Image]

  def imageOfWidth(desiredWidth: Int, tolerance: Int = 0): Option[Image] = {
    val validWidths = (desiredWidth - tolerance) to (desiredWidth + tolerance)
    val imagesInWidthRange = images.filter(image => validWidths contains image.width)
    imagesInWidthRange.sortBy(image => abs(desiredWidth - image.width)).headOption
  }
}

trait Trail extends Images {
  def webPublicationDate: DateTime
  def linkText: String
  def url: String
  def trailText: Option[String]
}

trait Tags {
  def tags: Seq[Tag]

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

case class Tag(private val tag: ApiTag) extends MetaData {
  lazy val name: String = tag.webTitle
  lazy val tagType: String = tag.`type`

  lazy val id: String = tag.id
  lazy val section: String = tag.sectionId.getOrElse("")
  lazy val apiUrl: String = tag.apiUrl
  lazy val webTitle = tag.webTitle

  lazy val url: String = RelativeUrl(tag)
  lazy val linkText = webTitle
}

class Content(content: ApiContent) extends Trail with Tags with MetaData {
  lazy val tags: Seq[Tag] = content.tags map { Tag(_) }

  lazy val url = RelativeUrl(content)
  lazy val linkText = webTitle
  lazy val trailText: Option[String] = content.safeFields.get("trailText")

  lazy val images: Seq[Image] = content.mediaAssets.filter { _.`type` == "picture" } map { Image(_) }

  lazy val id: String = content.id
  lazy val section: String = content.sectionId.getOrElse("")
  lazy val publication: String = content.safeFields.get("publication").getOrElse("")
  lazy val webPublicationDate: DateTime = content.webPublicationDate
  lazy val shortUrl: String = content.safeFields("shortUrl")
  lazy val apiUrl: String = content.apiUrl
  lazy val headline: String = content.safeFields("headline")
  lazy val webTitle = content.webTitle

  // Meta Data used by plugins on the page
  // people (including 3rd parties) rely on the names of these things, think carefully before changing them
  override def metaData = super.metaData ++ Map[String, Any](
    "keywords" -> keywords.map { _.name }.mkString(","),
    "description" -> trailText.getOrElse(""),
    "publication" -> publication,
    "tag-ids" -> tags.map(_.id).mkString(","),
    "author" -> contributors.map(_.name).mkString(","),
    "tones" -> tones.map(_.name).mkString(","),
    "series" -> series.map(_.name).mkString(","),
    "blogs" -> blogs.map(_.name).mkString(","),
    "web-publication-date" -> webPublicationDate,
    "short-url" -> shortUrl,
    "byline" -> content.safeFields.get("byline").getOrElse(""),
    "commentable" -> content.safeFields.get("commentable").getOrElse("false")
  )
}

class Article(private val content: ApiContent) extends Content(content) {
  lazy val body: String = content.safeFields("body")
  override lazy val metaData = super.metaData + ("content-type" -> "Article")
}
