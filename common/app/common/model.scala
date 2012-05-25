package common

import com.gu.openplatform.contentapi.model.{ MediaAsset => ApiMedia, Content => ApiContent, Tag => ApiTag, Section => ApiSection }
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

  // this is here so it can be included in analytics.
  // Basically it helps us understand the impact of changes and needs
  // to be an integral part of each page
  def buildNumber: String = ManifestData.build

  def metaData: Map[String, Any] = Map(
    "page-id" -> id,
    "section" -> section,
    "canonical-url" -> canonicalUrl,
    "api-url" -> apiUrl,
    "web-title" -> webTitle,
    "build-number" -> buildNumber
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

case class Image(private val delegate: ApiMedia) {
  private lazy val fields = delegate.fields getOrElse Map.empty[String, String]

  lazy val mediaType: String = delegate.`type`
  lazy val rel: String = delegate.rel
  lazy val index: Int = delegate.index

  lazy val url: Option[String] = delegate.file
  lazy val thumbnail: Option[String] = fields.get("thumbnail")
  lazy val width: Int = fields.get("width").map(_.toInt).getOrElse(0)

  lazy val caption: Option[String] = fields.get("caption")
  lazy val altText: Option[String] = fields.get("altText")

  lazy val source: Option[String] = fields.get("source")
  lazy val photographer: Option[String] = fields.get("photographer")
  lazy val credit: Option[String] = fields.get("credit")
}

case class Tag(private val delegate: ApiTag) extends MetaData {
  lazy val name: String = webTitle
  lazy val tagType: String = delegate.`type`

  lazy val id: String = delegate.id
  lazy val section: String = delegate.sectionId.getOrElse("")
  lazy val apiUrl: String = delegate.apiUrl
  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle

  lazy val canonicalUrl: String = webUrl

  lazy val url: String = SupportedUrl(delegate)
  lazy val linkText: String = webTitle
  lazy val pageId = delegate

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> name,
    "content-type" -> "Tag"
  )
}

case class Section(private val delegate: ApiSection) extends MetaData {
  lazy val name: String = webTitle
  lazy val section: String = id

  lazy val id: String = delegate.id
  lazy val apiUrl: String = delegate.apiUrl
  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle

  lazy val canonicalUrl: String = webUrl

  lazy val url: String = SupportedUrl(delegate)
  lazy val linkText: String = webTitle

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> name,
    "content-type" -> "Section"
  )
}

class Content(delegate: ApiContent) extends Trail with Tags with MetaData {
  private lazy val fields = delegate.safeFields
  override lazy val tags: Seq[Tag] = delegate.tags map { Tag(_) }

  lazy val url: String = SupportedUrl(delegate)
  lazy val linkText: String = webTitle
  lazy val trailText: Option[String] = fields.get("trailText")

  lazy val images: Seq[Image] = delegate.mediaAssets.filter { _.`type` == "picture" } map { Image(_) }

  lazy val id: String = delegate.id
  lazy val section: String = delegate.sectionId.getOrElse("")
  lazy val publication: String = fields.get("publication").getOrElse("")
  lazy val webPublicationDate: DateTime = delegate.webPublicationDate
  lazy val lastModified: DateTime = fields("lastModified").parseISODateTimeNoMillis
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val apiUrl: String = delegate.apiUrl
  lazy val webUrl: String = delegate.webUrl
  lazy val headline: String = fields("headline")
  lazy val webTitle: String = delegate.webTitle

  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val byline: Option[String] = fields.get("byline")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")

  lazy val canonicalUrl: String = webUrl

  lazy val isLive: Boolean = fields("liveBloggingNow") toBoolean

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
    "commentable" -> fields.get("commentable").map(_ == "true").getOrElse(false),
    "page-code" -> fields("internalPageCode")
  )
}

class Article(private val delegate: ApiContent) extends Content(delegate) {
  lazy val body: String = delegate.safeFields("body")
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> "Article")
}

class Gallery(private val delegate: ApiContent) extends Content(delegate) {
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
        case boolean: Boolean => toJson(boolean)
      }
    )
  }
}
