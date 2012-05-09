package common

import com.gu.openplatform.contentapi.model.{ MediaAsset => ApiMedia, Content => ApiContent, Tag => ApiTag }
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.libs.json.Json.toJson
import views.support.JavaScriptVariableName

trait MetaData {
  // indicates the absolute url of this page (the one to be used for search engine indexing)
  // see http://googlewebmastercentral.blogspot.co.uk/2009/02/specify-your-canonical.html
  def canonicalUrl: String

  def id: String
  def section: String
  def apiUrl: String
  def webTitle: String

  def metaData: Map[String, Any] = Map(
    "page-id" -> id,
    "section" -> section,
    "canonical-url" -> canonicalUrl,
    "api-url" -> apiUrl,
    "web-title" -> webTitle
  )
}

trait Images {
  def images: Seq[Image]

  def imageOfWidth(desiredWidth: Int, tolerance: Int = 0): Option[Image] = {
    val widthRange = (desiredWidth - tolerance) to (desiredWidth + tolerance)
    val imagesInWidthRange = images filter { _.width in widthRange }
    val imagesByDistance = imagesInWidthRange sortBy { _.width distanceFrom desiredWidth }

    imagesByDistance.headOption
  }
}

trait Trail extends Images with Tags {
  def webPublicationDate: DateTime
  def linkText: String
  def url: String
  def trailText: Option[String]
}

trait Tags {
  def tags: Seq[Tag] = Nil

  private def tagsOfType(tagType: String): Seq[Tag] = tags.filter(_.tagType == tagType)

  lazy val keywords: Seq[Tag] = tagsOfType("keyword")
  lazy val contributors: Seq[Tag] = tagsOfType("contributor")
  lazy val series: Seq[Tag] = tagsOfType("series")
  lazy val blogs: Seq[Tag] = tagsOfType("blog")
  lazy val tones: Seq[Tag] = tagsOfType("tone")
  lazy val types: Seq[Tag] = tagsOfType("type")
}

case class Image(private val media: ApiMedia) {
  private val fields = media.fields.getOrElse(Map.empty[String, String])

  lazy val mediaType: String = media.`type`
  lazy val rel: String = media.rel
  lazy val index: Int = media.index

  lazy val url: Option[String] = media.file
  lazy val thumbnail: Option[String] = fields.get("thumbnail")
  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(0)

  lazy val caption: Option[String] = fields.get("caption")
  lazy val altText: Option[String] = fields.get("altText")

  lazy val source: Option[String] = fields.get("source")
  lazy val photographer: Option[String] = fields.get("photographer")
  lazy val credit: Option[String] = fields.get("credit")
}

case class Tag(private val tag: ApiTag) extends MetaData {
  lazy val name: String = tag.webTitle
  lazy val tagType: String = tag.`type`

  lazy val id: String = tag.id
  lazy val section: String = tag.sectionId.getOrElse("")
  lazy val apiUrl: String = tag.apiUrl
  lazy val webTitle: String = tag.webTitle

  lazy val canonicalUrl: String = tag.webUrl

  lazy val url: String = SupportedUrl(tag)
  lazy val linkText: String = webTitle
}

class Content(content: ApiContent) extends Trail with Tags with MetaData {
  override lazy val tags: Seq[Tag] = content.tags map { Tag(_) }

  lazy val url: String = SupportedUrl(content)
  lazy val linkText: String = webTitle
  lazy val trailText: Option[String] = content.safeFields.get("trailText")

  lazy val images: Seq[Image] = content.mediaAssets.filter { _.`type` == "picture" } map { Image(_) }

  lazy val id: String = content.id
  lazy val section: String = content.sectionId.getOrElse("")
  lazy val publication: String = content.safeFields.get("publication").getOrElse("")
  lazy val webPublicationDate: DateTime = content.webPublicationDate
  lazy val shortUrl: String = content.safeFields("shortUrl")
  lazy val apiUrl: String = content.apiUrl
  lazy val headline: String = content.safeFields("headline")
  lazy val webTitle: String = content.webTitle

  lazy val standfirst: Option[String] = content.safeFields.get("standfirst")
  lazy val byline: Option[String] = content.safeFields.get("byline")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")

  lazy val canonicalUrl: String = content.webUrl

  // Meta Data used by plugins on the page
  // people (including 3rd parties) rely on the names of these things, think carefully before changing them
  override def metaData: Map[String, Any] = super.metaData ++ Map(
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
    "byline" -> byline.getOrElse(""),
    "commentable" -> content.safeFields.get("commentable").getOrElse("false")
  )
}

class Article(private val content: ApiContent) extends Content(content) {
  lazy val body: String = content.safeFields("body")
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> "Article")
}

class Gallery(private val content: ApiContent) extends Content(content) {
  private val lookup: Map[Int, Image] = (images map { image => (image.index, image) }).toMap

  def apply(index: Int): Image = lookup(index)
  lazy val size = images.size

  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> "Gallery")
}

trait Formats {
  implicit val imageFormat: Writes[Image] = new Writes[Image] {
    def writes(image: Image): JsValue = toJson(
      Map(
        "index" -> toJson(image.index),
        "url" -> toJson(image.url),
        "thumbnail" -> toJson(image.thumbnail),
        "width" -> toJson(image.width),
        "caption" -> toJson(image.caption),
        "altText" -> toJson(image.altText),
        "source" -> toJson(image.source),
        "photographer" -> toJson(image.photographer),
        "credit" -> toJson(image.credit)
      )
    )
  }

  implicit val galleryFormat: Writes[Gallery] = new Writes[Gallery] {
    def writes(gallery: Gallery): JsValue = toJson(
      Map(
        "pictures" -> (gallery.images.toList sortBy { _.index } map { image: Image => toJson(image) })
      )
    )
  }

  // Some advice at: http://markembling.info/2011/07/json-date-time
  implicit val dateTimeFormat: Writes[DateTime] = new Writes[DateTime] {
    def writes(datetime: DateTime) = toJson(datetime.toISODateTimeString)
  }

  implicit val metaDataFormat: Writes[MetaData] = new Writes[MetaData] {
    def writes(item: MetaData): JsValue = toJson(
      item.metaData map {
        case (key, value) => JavaScriptVariableName(key) -> value
      } mapValues {
        case date: DateTime => toJson(date)
        case string: String => toJson(string)
      }
    )
  }
}
