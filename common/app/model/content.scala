package model

import com.gu.openplatform.contentapi.model.{Content => ApiContent, Element => ApiElement, Asset}
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import common.Reference
import org.jsoup.Jsoup
import collection.JavaConversions._
import views.support.{Naked, ImgSrc}
import views.support.StripHtmlTagsAndUnescapeEntities

class Content protected (delegate: ApiContent) extends Trail with Tags with MetaData {

  lazy val publication: String = fields.get("publication").getOrElse("")
  lazy val lastModified: DateTime = fields("lastModified").parseISODateTimeNoMillis
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val shortUrlId: String = delegate.safeFields("shortUrl").replace("http://gu.com", "")
  lazy val webUrl: String = delegate.webUrl
  lazy val wordCount: String = fields.get("wordcount").getOrElse("")
  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val starRating: Option[String] = fields.get("starRating")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")
  lazy val allowUserGeneratedContent: Boolean = fields.get("allowUgc").map(_.toBoolean).getOrElse(false)
  lazy val isCommentable: Boolean = fields.get("commentable").map(_ == "true").getOrElse(false)
  lazy val isClosedForComments: Boolean = fields.get("commentCloseDate").filter(_.parseISODateTimeNoMillis.isAfterNow).isEmpty
  lazy val isExpired = delegate.isExpired.getOrElse(false)
  lazy val blockAds: Boolean = videoAssets.exists(_.blockAds)
  lazy val isLiveBlog: Boolean = delegate.isLiveBlog
  lazy val openGraphImage: String = mainPicture.flatMap(_.url).getOrElse(conf.Configuration.facebook.imageFallback)
  lazy val bodyImages = imageMap("body")

  lazy val witnessAssignment = delegate.references.find(_.`type` == "witness-assignment")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val cricketMatch: Option[String] = delegate.references.find(_.`type` == "esa-cricket-match")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val imageMap: Map[String,List[ImageElement]] = {
    elements("image").collect {
      case (relation, elements) => ( relation -> elements.collect{case x:ImageElement => x})
    }.toMap.withDefaultValue(Nil)
  }

  lazy val videoMap: Map[String,List[VideoElement]] = {
    elements("video").collect {
      case (relation, elements) => ( relation -> elements.collect{case x:VideoElement => x})
    }.toMap.withDefaultValue(Nil)
  }

  private lazy val fields: Map[String, String] = delegate.safeFields

  // Inherited from Trail
  override lazy val webPublicationDate: DateTime = delegate.webPublicationDate
  override lazy val linkText: String = webTitle
  override lazy val headline: String = fields("headline")
  override lazy val url: String = SupportedUrl(delegate)
  override lazy val trailText: Option[String] = fields.get("trailText")
  override lazy val section: String = delegate.sectionId.getOrElse("")
  override lazy val sectionName: String = delegate.sectionName.getOrElse("")
  override lazy val thumbnailPath: Option[String] = fields.get("thumbnail").map(ImgSrc(_, Naked))
  override lazy val isLive: Boolean = fields("liveBloggingNow").toBoolean
  override lazy val discussionId = Some(shortUrlPath)
  override lazy val leadingParagraphs: List[org.jsoup.nodes.Element] = {
    val body = delegate.safeFields.get("body")
    val souped = body flatMap { body =>
      val souped = Jsoup.parseBodyFragment(body).body().select("p")
      Option(souped) map { _.toList }
    }

    souped getOrElse Nil
  }
  override lazy val byline: Option[String] = fields.get("byline")
  override lazy val trailType: Option[String] = {
    if (tags.exists(_.id == "tone/comment")) {
      Option("comment")
    } else if (tags.exists(_.id == "tone/features")) {
      Option("feature")
    } else {
      Option("news")
    }
  }

  // Inherited from Tags
  override lazy val tags: Seq[Tag] = delegate.tags map { Tag(_) }

  // Inherited from MetaData
  override lazy val id: String = delegate.id
  override lazy val webTitle: String = delegate.webTitle
  override lazy val analyticsName = s"GFE:$section:${id.substring(id.lastIndexOf("/") + 1)}"
  // Meta Data used by plugins on the page
  // people (including 3rd parties) rely on the names of these things, think carefully before changing them
  override def metaData: Map[String, Any] = { super.metaData ++ Map(
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
  }
  override lazy val cacheSeconds = {
    if (isLive) 30 // live blogs can expect imminent updates
    else if (lastModified > DateTime.now - 1.hour) 60 // an hour gives you time to fix obvious typos and stuff
    else 900
  }
  override def openGraph: List[(String, Any)] = super.openGraph ++ List(
    "og:title" -> webTitle,
    "og:url" -> webUrl,
    "og:description" -> trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse("")
  )
    
  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:app:url:googleplay" -> webUrl.replace("http", "guardian")
  )

  // Inherited from Trail.Elements
  override lazy val images: List[ImageElement] = imageMap("main")
  override lazy val videos: List[VideoElement] = videoMap("main") ++ videoMap("body")
  override lazy val thumbnail: Option[ImageElement] = imageMap("thumbnail").headOption
  override lazy val mainPicture: Option[ImageAsset] = largestMainPicture.orElse(thumbnail.flatMap(_.largestImage))
  override lazy val mainVideo: Option[VideoElement] = videoMap("main").headOption

  private def elements(elementType: String): Map[String,List[Element]] = {
    // Find the elements associated with a given element type, keyed by a relation string.
    // Example relations are gallery, thumbnail, main, body
    delegate.elements.map(_.filter(_.elementType == elementType)
                           .groupBy(_.relation)
                           .mapValues(_.map(element => Element(element)).toList)
    ).getOrElse(Map.empty).withDefaultValue(Nil)
  }
}

object Content {

  def apply(delegate: ApiContent): Content = {
    delegate match {
      case gallery if delegate.isGallery => new Gallery(delegate)
      case video if delegate.isVideo => new Video(delegate)
      case liveBlog if delegate.isLiveBlog => new LiveBlog(delegate)
      case article if delegate.isArticle || delegate.isSudoku => new Article(delegate)
      case picture if delegate.isImageContent => new ImageContent(delegate)
      case _ => new Content(delegate)
    }
  }
}

class Article(private val delegate: ApiContent) extends Content(delegate) {
  lazy val body: String = delegate.safeFields.getOrElse("body","")
  lazy val contentType = "Article"
  lazy val isReview = tones.exists(_.id == "tone/reviews")
  
  // A legacy body have an embedded video at the top.
  lazy val hasVideoAtTop: Boolean = Jsoup.parseBodyFragment(body).body().children().headOption
    .map(e => e.hasClass("gu-video") && e.tagName() == "video")
    .getOrElse(false)

  // True if the content model has at least one video asset in the 'main' relation.
  lazy val hasMainVideo: Boolean = mainVideo.flatMap(_.videoAssets.headOption).isDefined

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override def schemaType = if (isReview) Some("http://schema.org/Review") else Some("http://schema.org/Article")

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    ("content-type", contentType),
    ("isLiveBlog", isLiveBlog)
  )

  override def openGraph: List[(String, Any)] = super.openGraph ++ List(
    "og:type" -> "article",
    "article:published_time" -> webPublicationDate,
    "article:modified_time" -> lastModified,
    "article:section" -> sectionName,
    "og:image" -> openGraphImage
  ) ++ tags.map("article:tag" -> _.name) ++
    tags.filter(_.isContributor).map("article:author" -> _.webUrl)
  
  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "summary_large_image"
  ) ++ images.sortBy(_.index).flatMap(_.imageCrops).take(1).map( "twitter:image:src" -> _.path )

  override lazy val mainPicture: Option[ImageAsset] = {
    largestMainPicture.orElse(
      if (!videoAssets.isEmpty) {
        val video = videoAssets.head
        Some(ImageAsset(new Asset("image",
                                  Some("image/jpeg"),
                                  video.stillImageUrl,
                                  Map("width" -> video.width.toString,
                                      "height" -> video.height.toString)), 0))
      } else {
        None
      }
    ).orElse(thumbnail.flatMap(_.largestImage))
  }
}

class LiveBlog(private val delegate: ApiContent) extends Article(delegate) {
  private lazy val soupedBody = Jsoup.parseBodyFragment(body).body()
  lazy val blockCount: Int = soupedBody.select(".block").size()
  lazy val summary: Option[String] = soupedBody.select(".is-summary").headOption.map(_.toString)
  lazy val groupedBlocks: List[String]= soupedBody.select(".block").toList.grouped(10).map { group =>
    group.map(_.toString).mkString
  }.toList
  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "summary"
  )
}

class Video(private val delegate: ApiContent) extends Content(delegate) {

  private implicit val ordering = EncodingOrdering

  lazy val encodings: Seq[Encoding] = {
    videoAssets.toList.collect {
      case video: VideoAsset => Encoding(video.url.getOrElse(""), video.mimeType.getOrElse(""))
    }.sorted
  }

  lazy val duration: Int = videoAssets.headOption.map(_.duration).getOrElse(0)

  lazy val contentType = "Video"
  lazy val source: Option[String] = videoAssets.headOption.flatMap(_.source)

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData +("content-type" -> contentType, "blockAds" -> blockAds, "source" -> source.getOrElse(""))

  override def openGraph: List[(String, Any)] = super.openGraph ++ List(
    "og:type" -> "video",
    "og:video:type" -> "text/html",
    "og:video:url" -> webUrl,
    "og:image" -> openGraphImage
  ) ++ tags.map("video:tag" -> _.name)
}

class Gallery(private val delegate: ApiContent) extends Content(delegate) {

  def apply(index: Int): ImageAsset = images(index).largestImage.get

  lazy val size = images.size
  lazy val contentType = "Gallery"
  lazy val landscapes = images.sortBy(_.index).flatMap(_.imageCrops).filter(i => i.width > i.height)
  lazy val portraits = images.sortBy(_.index).flatMap(_.imageCrops).filter(i => i.width < i.height)
  lazy val isInPicturesSeries = tags.exists(_.id == "lifeandstyle/series/in-pictures")

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType, "gallerySize" -> size)

  override def openGraph: List[(String, Any)] = super.openGraph ++ List(
    "og:type" -> "article",
    "article:published_time" -> webPublicationDate,
    "article:modified_time" -> lastModified,
    "article:section" -> sectionName,
    "og:image" -> openGraphImage
  ) ++ tags.map("article:tag" -> _.name) ++
    tags.filter(_.isContributor).map("article:author" -> _.webUrl)
  
  override lazy val images: List[ImageElement] = imageMap("gallery")
  
  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "gallery",
    "twitter:title" -> linkText
  ) ++ images.sortBy(_.index).flatMap(_.imageCrops).take(5).zipWithIndex.map{ case(image, index) =>
    s"twitter:image$index:src" -> image.path
  }

}

class Interactive(private val delegate: ApiContent) extends Content(delegate) {
  lazy val contentType = "Interactive"
  lazy val body: String = delegate.safeFields("body")
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
}

class ImageContent(private val delegate: ApiContent) extends Content(delegate) {

  lazy val contentType = "ImageContent"
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
  
  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "photo"
  ) ++ images.sortBy(_.index).flatMap(_.imageCrops).take(1).map( "twitter:image:src" -> _.path )
}
