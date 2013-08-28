package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, MediaAsset }
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import common.Reference
import org.jsoup.Jsoup
import collection.JavaConversions._
import views.support.{Naked, ImgSrc}
import conf.Configuration
import views.support.StripHtmlTagsAndUnescapeEntities

class Content(delegate: ApiContent) extends Trail with Tags with MetaData {

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
  lazy val blockAds: Boolean = videoAssets.exists(_.safeFields.get("blockAds").map(_.toBoolean).getOrElse(false))

  lazy val id: String = delegate.id
  lazy val sectionName: String = delegate.sectionName.getOrElse("")
  lazy val section: String = delegate.sectionId.getOrElse("")
  lazy val publication: String = fields.get("publication").getOrElse("")
  lazy val webPublicationDate: DateTime = delegate.webPublicationDate
  lazy val lastModified: DateTime = fields("lastModified").parseISODateTimeNoMillis
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val shortUrlId: String = delegate.safeFields("shortUrl").replace("http://gu.com", "")
  lazy val webUrl: String = delegate.webUrl
  lazy val headline: String = fields("headline")
  lazy val webTitle: String = delegate.webTitle
  lazy val wordCount: String = fields.get("wordcount").getOrElse("")

  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val starRating: Option[String] = fields.get("starRating")

  override lazy val leadingParagraphs: List[org.jsoup.nodes.Element] = {
    val body = delegate.safeFields.get("body")
    val souped = body flatMap { body =>
      val souped = Jsoup.parseBodyFragment(body).body().select("p")
      Option(souped) map { _.toList }
    }

    souped getOrElse Nil
  }

  override lazy val byline: Option[String] = fields.get("byline")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")

  override lazy val discussionId = Some(shortUrlPath)

  lazy val allowUserGeneratedContent: Boolean = fields.get("allowUgc").map(_.toBoolean).getOrElse(false)

  lazy val isLive: Boolean = fields("liveBloggingNow").toBoolean
  lazy val isCommentable: Boolean = fields.get("commentable").map(_ == "true").getOrElse(false)

  override lazy val thumbnail: Option[String] = fields.get("thumbnail")
  override lazy val thumbnailPath: Option[String] = fields.get("thumbnail").map(ImgSrc(_, Naked))

  override lazy val analyticsName = s"GFE:$section:${id.substring(id.lastIndexOf("/") + 1)}"

  lazy val isExpired = delegate.isExpired.getOrElse(false)

  lazy val witnessAssignment = delegate.references.find(_.`type` == "witness-assignment")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val cricketMatch: Option[String] = delegate.references.find(_.`type` == "esa-cricket-match")
    .map(_.id).map(Reference(_)).map(_._2)

  override lazy val trailType: Option[String] = {
    if (tags.exists(_.id == "tone/features")) {
      Option("feature")
    } else if (tags.exists(_.id == "tone/comment")) {
      Option("comment")
    } else {
      Option("news")
    }
  }

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
    ("commentable", isCommentable),
    ("has-story-package", fields.get("hasStoryPackage").map(_.toBoolean).getOrElse(false)),
    ("page-code", fields("internalPageCode")),
    ("isLive", isLive),
    ("wordCount", wordCount),
    ("shortUrl", shortUrl),
    ("thumbnail", thumbnailPath.getOrElse(false))
  ) ++ Map(("references", delegate.references.map(r => Reference(r.id))))

  override def openGraph: List[(String, Any)] = super.openGraph ++ List(
    "og:title" -> webTitle,
    "og:url" -> webUrl,
    "og:description" -> trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse("")
  )

  override lazy val cacheSeconds = {
    if (isLive) 30 // live blogs can expect imminent updates
    else if (lastModified > DateTime.now - 1.hour) 60 // an hour gives you time to fix obvious typos and stuff
    else 900
  }
}

object Content {

  def apply(delegate: ApiContent): Content = {
    delegate match {
      case gallery if delegate.isGallery => new Gallery(delegate)
      case video if delegate.isVideo => new Video(delegate)
      case article if delegate.isArticle => new Article(delegate)
      case d => new Content(d)
    }
  }

}

class Article(private val delegate: ApiContent) extends Content(delegate) {
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

  override def openGraph: List[(String, Any)] = super.openGraph ++ List(
    "og:type" -> "article",
    "article:published_time" -> webPublicationDate,
    "article:modified_time" -> lastModified,
    "article:section" -> sectionName,
    "og:image" -> mainPicture.map(_.path).getOrElse(conf.Configuration.facebook.imageFallback)
  ) ++ tags.map("article:tag" -> _.name) ++
    tags.filter(_.isContributor).map("article:author" -> _.webUrl)
}

class Video(private val delegate: ApiContent) extends Content(delegate) with Images {

  private implicit val ordering = EncodingOrdering

  lazy val videoAsset: Option[MediaAsset] = videoAssets.headOption
  lazy val encodings: Seq[Encoding] = videoAsset.map(_.encodings.map(Encoding(_))).getOrElse(Nil).sorted
  lazy val contentType = "Video"
  lazy val source: Option[String] = videoAsset.flatMap(_.safeFields.get("source"))
  lazy val duration: Int = videoAsset.map { videoAsset =>
    videoAsset.fields.map { fields =>
      fields.get("durationSeconds").getOrElse("0").toInt + (fields.get("durationMinutes").getOrElse("0").toInt * 60)
    }.getOrElse(0)
  }.getOrElse(0)

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData +("content-type" -> contentType, "blockAds" -> blockAds, "source" -> source.getOrElse(""))

  override def openGraph: List[(String, Any)] = super.openGraph ++ List(
    "og:type" -> "video",
    "og:video:type" -> "text/html",
    "og:video:url" -> webUrl,
    "og:image" -> imageOfWidth(640).map(_.path).getOrElse(mainPicture.map(_.path).getOrElse(conf.Configuration.facebook.imageFallback))
  ) ++ tags.map("video:tag" -> _.name)
}

class Gallery(private val delegate: ApiContent) extends Content(delegate) {
  private val lookup: Map[Int, Image] = (images map { image => (image.index, image) }).toMap
  def apply(index: Int): Image = lookup(index)
  lazy val size = images.size
  lazy val contentType = "Gallery"
  lazy val landscapes = images.filter(i => i.width > i.height)
  lazy val portraits = images.filter(i => i.width < i.height)
  lazy val isInPicturesSeries = tags.exists(_.id == "lifeandstyle/series/in-pictures")

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType, "gallerySize" -> size)
  override def openGraph: List[(String, Any)] = super.openGraph ++ List(
    "og:type" -> "article",
    "article:published_time" -> webPublicationDate,
    "article:modified_time" -> lastModified,
    "article:section" -> sectionName,
    "og:image" -> images.head.path
  ) ++ tags.map("article:tag" -> _.name) ++
    tags.filter(_.isContributor).map("article:author" -> _.webUrl)
}

class Interactive(private val delegate: ApiContent) extends Content(delegate) {
  lazy val contentType = "Interactive"
  lazy val body: String = delegate.safeFields("body")
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
}
