package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, MediaAsset }
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import common.Reference
import org.jsoup.Jsoup
import collection.JavaConversions._

class Content(
    delegate: ApiContent,
    override val storyItems: Option[StoryItems] = None) extends Trail with Tags with MetaData {
  private lazy val fields = delegate.safeFields
  override lazy val tags: Seq[Tag] = delegate.tags map { Tag(_) }

  lazy val url: String = SupportedUrl(delegate)
  lazy val linkText: String = webTitle
  lazy val trailText: Option[String] = fields.get("trailText")

  lazy val images: Seq[Image] = delegate.mediaAssets.filter { _.`type` == "picture" } map { Image(_) }

  lazy val videoImages: Seq[Image] = delegate.mediaAssets.filter(_.`type` == "video")
    .filter(_.safeFields.isDefinedAt("stillImageUrl"))
    .map { videoAsset => Image(videoAsset.copy(file = videoAsset.safeFields.get("stillImageUrl"))) }

  lazy val videoAssets: Seq[MediaAsset] = delegate.mediaAssets.filter { m: MediaAsset => m.`type` == "video" }

  lazy val id: String = delegate.id
  lazy val sectionName: String = delegate.sectionName.getOrElse("")
  lazy val section: String = delegate.sectionId.getOrElse("")
  lazy val publication: String = fields.get("publication").getOrElse("")
  lazy val webPublicationDate: DateTime = delegate.webPublicationDate
  lazy val lastModified: DateTime = fields("lastModified").parseISODateTimeNoMillis
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val webUrl: String = delegate.webUrl
  lazy val headline: String = fields("headline")
  lazy val webTitle: String = delegate.webTitle
  lazy val wordCount: String = fields.get("wordcount").getOrElse("")

  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val starRating: Option[String] = fields.get("starRating")

  lazy val byline: Option[String] = fields.get("byline")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")

  lazy val allowUserGeneratedContent: Boolean = fields.get("allowUgc").map(_.toBoolean).getOrElse(false)

  override lazy val canonicalUrl = Some(webUrl)

  lazy val isLive: Boolean = fields("liveBloggingNow").toBoolean

  override lazy val thumbnail: Option[String] = fields.get("thumbnail")

  override lazy val analyticsName = s"GFE:$section:${id.substring(id.lastIndexOf("/") + 1)}"

  lazy val isExpired = delegate.isExpired.getOrElse(false)

  lazy val witnessAssignment = delegate.references.find(_.`type` == "witness-assignment")
    .map(_.id).map(Reference(_)).map(_._2)

  // Meta Data used by plugins on the page
  // people (including 3rd parties) rely on the names of these things, think carefully before changing them
  override def metaData: Map[String, Any] = super.metaData ++ Map(
    ("keywords", keywords.map { _.name }.mkString(",")),
    ("publication", publication),
    ("headline", headline),
    ("web-publication-date", webPublicationDate),
    ("author", contributors.map(_.name).mkString(",")),
    ("tones", tones.map(_.name).mkString(",")),
    ("series", series.map { _.name }.mkString(",")),
    ("blogs", blogs.map { _.name }.mkString(",")),
    ("commentable", fields.get("commentable").map(_ == "true").getOrElse(false)),
    ("has-story-package", fields.get("hasStoryPackage").map(_.toBoolean).getOrElse(false)),
    ("page-code", fields("internalPageCode")),
    ("isLive", isLive),
    ("wordCount", wordCount)
  ) ++ Map(("references", delegate.references.map(r => Reference(r.id))))

  override lazy val cacheSeconds = {
    if (isLive) 5
    else if (lastModified > DateTime.now - 24.hours) 60
    else 900
  }
}

object Content {

  def apply(delegate: ApiContent, storyItems: Option[StoryItems]): Content = {
    delegate match {
      case gallery if delegate.isGallery => new Gallery(delegate, storyItems)
      case video if delegate.isVideo => new Video(delegate, storyItems)
      case article if delegate.isArticle => new Article(delegate, storyItems)
      case d => new Content(d, storyItems)
    }
  }

}

class Article(private val delegate: ApiContent, storyItems: Option[StoryItems] = None) extends Content(delegate, storyItems) {
  lazy val body: String = delegate.safeFields("body")
  lazy val contentType = "Article"
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
  override lazy val inBodyPictureCount = body.split("class='gu-image'").size - 1
  lazy val isReview = tones.exists(_.id == "tone/reviews")
  lazy val isLiveBlog = tones.exists(_.id == "tone/minutebyminute")

  lazy val hasVideoAtTop: Boolean = Jsoup.parseBodyFragment(body).body().children().headOption
    .map(e => e.hasClass("gu-video") && e.tagName() == "video")
    .getOrElse(false)

  override def schemaType = if (isReview) Some("http://schema.org/Review") else Some("http://schema.org/Article")
}

class Video(private val delegate: ApiContent, storyItems: Option[StoryItems] = None) extends Content(delegate, storyItems) {

  private implicit val ordering = EncodingOrdering

  private val videoAsset: Option[MediaAsset] = videoAssets.headOption
  lazy val encodings: Seq[Encoding] = videoAsset.map(_.encodings.map(Encoding(_))).getOrElse(Nil).sorted
  lazy val contentType = "Video"
  lazy val blockAds: Boolean = videoAsset.map(_.safeFields.get("blockAds").map(_.toBoolean).getOrElse(false)).getOrElse(false)
  lazy val source: Option[String] = videoAsset.flatMap(_.safeFields.get("source"))

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData +("content-type" -> contentType, "blockAds" -> blockAds, "source" -> source.getOrElse(""))
}

class Gallery(private val delegate: ApiContent, storyItems: Option[StoryItems] = None) extends Content(delegate, storyItems) {
  private val lookup: Map[Int, Image] = (images map { image => (image.index, image) }).toMap
  def apply(index: Int): Image = lookup(index)
  lazy val size = images.size
  lazy val contentType = "Gallery"
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType, "gallerySize" -> size)
}

case class Quote(
  text: Option[String] = None,
  by: Option[String] = None,
  url: Option[String] = None,
  subject: Option[String] = None)

case class StoryItems(
  importance: Int,
  colour: Int,
  shares: Option[Int] = None,
  comments: Option[Int] = None,
  quote: Option[Quote] = None)