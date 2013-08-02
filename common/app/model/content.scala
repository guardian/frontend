package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Asset, Element => ApiElement}
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import common.Reference
import org.jsoup.Jsoup
import collection.JavaConversions._
import views.support.{Naked, ImgSrc}

class Content protected (
    delegate: ApiContent) extends Trail with Tags with MetaData {


  private lazy val fields = delegate.safeFields

  lazy val publication: String = fields.get("publication").getOrElse("")
  lazy val lastModified: DateTime = fields("lastModified").parseISODateTimeNoMillis
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val shortUrlId: String = delegate.safeFields("shortUrl").replace("http://gu.com", "")
  lazy val webUrl: String = delegate.webUrl
  lazy val wordCount: String = fields.get("wordcount").getOrElse("")
  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val starRating: Option[String] = fields.get("starRating")
  lazy val byline: Option[String] = fields.get("byline")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")
  lazy val allowUserGeneratedContent: Boolean = fields.get("allowUgc").map(_.toBoolean).getOrElse(false)
  lazy val isCommentable: Boolean = fields.get("commentable").map(_ == "true").getOrElse(false)
  lazy val isExpired = delegate.isExpired.getOrElse(false)
  lazy val blockAds: Boolean = videoAssets.exists(_.typeData.get("blockAds").map(_.toBoolean).getOrElse(false))

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

  protected val relation = "main"

  override lazy val tags: Seq[Tag] = delegate.tags map { Tag(_) }
  override lazy val url: String = SupportedUrl(delegate)
  override lazy val linkText: String = webTitle
  override lazy val trailText: Option[String] = fields.get("trailText")
  override lazy val id: String = delegate.id
  override lazy val sectionName: String = delegate.sectionName.getOrElse("")
  override lazy val section: String = delegate.sectionId.getOrElse("")
  override lazy val webPublicationDate: DateTime = delegate.webPublicationDate
  override lazy val headline: String = fields("headline")
  override lazy val webTitle: String = delegate.webTitle
  override lazy val discussionId = Some(shortUrlPath)
  override lazy val canonicalUrl = Some(webUrl)
  override lazy val isLive: Boolean = fields("liveBloggingNow").toBoolean
  override lazy val thumbnail: Option[String] = fields.get("thumbnail")
  override lazy val thumbnailPath: Option[String] = fields.get("thumbnail").map(ImgSrc(_, Naked))
  override lazy val analyticsName = s"GFE:$section:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val images: List[ImageElement] = imageMap(relation).sortBy(_.index)
  override lazy val videos: List[VideoElement] = videoMap(relation).sortBy(_.index)

  override lazy val cacheSeconds = {
    if (isLive) 30 // live blogs can expect imminent updates
    else if (lastModified > DateTime.now - 1.hour) 60 // an hour gives you time to fix obvious typos and stuff
    else 900
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
    ("shortUrl", shortUrl)
  ) ++ Map(("references", delegate.references.map(r => Reference(r.id))))

  private def findIndex( element: ApiElement): Int =  {
    // Use the old media asset class, which defines an index, and find a media asset with a matching file path to the element
    delegate.mediaAssets.find(element.assets.flatMap(_.file) contains _.file.getOrElse("")).map(_.index).getOrElse(0)
  }

  private def elements(elementType: String): Map[String,List[Element]] = {
    // Find the elements associated with a given element type, keyed by a relation string.
    // Example relations are gallery, thumbnail, main, body
    delegate.elements.map(_.values
      .filter(_.elementType == elementType)
      .groupBy(_.relation)
      .mapValues(_.map(element => Element(element, findIndex(element))).toList)
    ).getOrElse(Map.empty).withDefaultValue(Nil)
  }
}

object Content {

  def apply(delegate: ApiContent): Content = {
    delegate match {
      case gallery if delegate.isGallery => new Gallery(delegate, storyItems)
      case video if delegate.isVideo => new Video(delegate, storyItems)
      case article if delegate.isArticle => new Article(delegate, storyItems)
      case _ => new Content(delegate, storyItems)
    }
  }
}

class Article(private val delegate: ApiContent) extends Content(delegate) {
  lazy val body: String = delegate.safeFields("body")
  lazy val contentType = "Article"
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
  lazy val isReview = tones.exists(_.id == "tone/reviews")
  lazy val isLiveBlog = tones.exists(_.id == "tone/minutebyminute")

  lazy val hasVideoAtTop: Boolean = Jsoup.parseBodyFragment(body).body().children().headOption
    .map(e => e.hasClass("gu-video") && e.tagName() == "video")
    .getOrElse(false)

  override def schemaType = if (isReview) Some("http://schema.org/Review") else Some("http://schema.org/Article")
}

class Video(private val delegate: ApiContent) extends Content(delegate) {

  private implicit val ordering = EncodingOrdering

  lazy val encodings: Seq[Encoding] = {
    videoAssets.toList.collect {
      case Asset(_,Some(mimeType),Some(file),_) => Encoding(file, mimeType)
    }.sorted
  }

  lazy val contentType = "Video"
  lazy val source: Option[String] = videoAssets.headOption.flatMap(_.typeData.get("source"))

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData +("content-type" -> contentType, "blockAds" -> blockAds, "source" -> source.getOrElse(""))
}

<<<<<<< HEAD
class Gallery(private val delegate: ApiContent) extends Content(delegate) {
  private val lookup: Map[Int, Image] = (images map { image => (image.index, image) }).toMap
  def apply(index: Int): Image = lookup(index)
=======
class Gallery(private val delegate: ApiContent, storyItems: Option[StoryItems] = None) extends Content(delegate, storyItems) {

  def apply(index: Int): Image = images(index).image.get

>>>>>>> Replace most media asset use with content-api element
  lazy val size = images.size
  lazy val contentType = "Gallery"
  lazy val landscapes = images.flatMap(_.imageCrops).filter(i => i.width > i.height)
  lazy val isInPicturesSeries = tags.exists(_.id == "lifeandstyle/series/in-pictures")

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType, "gallerySize" -> size)

  override val relation = "gallery"
}

class Interactive(private val delegate: ApiContent) extends Content(delegate) {
  lazy val contentType = "Interactive"
  lazy val body: String = delegate.safeFields("body")
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
}
