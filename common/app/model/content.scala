package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, MediaAsset }
import org.joda.time.DateTime

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
  lazy val byline: Option[String] = fields.get("byline")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")

  lazy val canonicalUrl: String = webUrl

  lazy val isLive: Boolean = fields("liveBloggingNow").toBoolean

  override lazy val thumbnail: Option[String] = fields.get("thumbnail")

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

  override lazy val inBodyPictureCount = body.split("class='gu-image'").size - 1
}

class Video(private val delegate: ApiContent) extends Content(delegate) {

  private val videoAsset: Option[MediaAsset] = delegate.mediaAssets.filter { m: MediaAsset => m.`type` == "video" }.headOption

  lazy val encodings: Seq[Encoding] = videoAsset.map(_.encodings.map(Encoding(_))).getOrElse(Nil)

  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> "Video")
}

class Gallery(private val delegate: ApiContent) extends Content(delegate) {
  private val lookup: Map[Int, Image] = (images map { image => (image.index, image) }).toMap

  def apply(index: Int): Image = lookup(index)
  lazy val size = images.size

  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> "Gallery")
}