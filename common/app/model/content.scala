package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, MediaAsset }
import org.joda.time.DateTime
import org.scala_tools.time.Imports._

class Content(delegate: ApiContent) extends Trail with Tags with MetaData {
  private lazy val fields = delegate.safeFields
  override lazy val tags: Seq[Tag] = delegate.tags map { Tag(_) }

  lazy val url: String = SupportedUrl(delegate)
  lazy val linkText: String = webTitle
  lazy val trailText: Option[String] = fields.get("trailText")

  lazy val images: Seq[Image] = delegate.mediaAssets.filter { _.`type` == "picture" } map { Image(_) }

  lazy val id: String = delegate.id
  lazy val sectionName: String = delegate.sectionName.getOrElse("")
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
  lazy val starRating: Option[String] = fields.get("starRating")

  lazy val byline: Option[String] = fields.get("byline")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")

  lazy val canonicalUrl: String = webUrl

  lazy val isLive: Boolean = fields("liveBloggingNow").toBoolean

  override lazy val thumbnail: Option[String] = fields.get("thumbnail")

  override lazy val analyticsName = "GFE:" + section + ":" + id.substring(id.lastIndexOf("/") + 1)

  // Meta Data used by plugins on the page
  // people (including 3rd parties) rely on the names of these things, think carefully before changing them
  override def metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> keywords.map { _.name }.mkString(","),
    "publication" -> publication,
    "headline" -> headline,
    "web-publication-date" -> webPublicationDate,
    "author" -> contributors.map(_.name).mkString(","),
    "tones" -> tones.map(_.name).mkString(","),
    "series" -> series.map { _.name }.mkString(","),
    "blogs" -> blogs.map { _.name }.mkString(","),
    "commentable" -> fields.get("commentable").map(_ == "true").getOrElse(false),
    "show-in-related" -> fields.get("showInRelatedContent").map(_.toBoolean).getOrElse(true),
    "page-code" -> fields("internalPageCode"),
    "isLive" -> isLive
  )

  override lazy val cacheSeconds = {
    if (isLive) 5
    else if (lastModified > DateTime.now - 24.hours) 60
    else 900
  }
}

class Article(private val delegate: ApiContent) extends Content(delegate) {
  lazy val body: String = delegate.safeFields("body")
  lazy val contentType = "Article"
  override lazy val analyticsName = "GFE:" + section + ":" + contentType + ":" + id.substring(id.lastIndexOf("/") + 1)
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
  override lazy val inBodyPictureCount = body.split("class='gu-image'").size - 1
  lazy val isReview = tones.exists(_.id == "tone/reviews")
  override def schemaType = if (isReview) Some("http://schema.org/Review") else Some("http://schema.org/Article")
}

class Video(private val delegate: ApiContent) extends Content(delegate) {
  private val videoAsset: Option[MediaAsset] = delegate.mediaAssets.filter { m: MediaAsset => m.`type` == "video" }.headOption
  lazy val encodings: Seq[Encoding] = videoAsset.map(_.encodings.map(Encoding(_))).getOrElse(Nil)
  lazy val contentType = "Video"

  override lazy val analyticsName = "GFE:" + section + ":" + contentType + ":" + id.substring(id.lastIndexOf("/") + 1)
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
}

class Gallery(private val delegate: ApiContent) extends Content(delegate) {
  private val lookup: Map[Int, Image] = (images map { image => (image.index, image) }).toMap
  def apply(index: Int): Image = lookup(index)
  lazy val size = images.size
  lazy val contentType = "Gallery"
  override lazy val analyticsName = "GFE:" + section + ":" + contentType + ":" + id.substring(id.lastIndexOf("/") + 1)
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
}