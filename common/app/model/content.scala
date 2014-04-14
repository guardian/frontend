package model

import com.gu.openplatform.contentapi.model.{Content => ApiContent, Element => ApiElement, Asset, Tag => ApiTag}
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import common.{Sponsor, Sponsors}
import common.{LinkCounts, LinkTo, Reference}
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist
import collection.JavaConversions._
import views.support.{VisualTone, Naked, ImgSrc, StripHtmlTagsAndUnescapeEntities}
import play.api.libs.json.JsValue
import conf.Configuration.facebook

class Content protected (val apiContent: ApiContentWithMeta) extends Trail with MetaData {

  lazy val delegate: ApiContent = apiContent.delegate

  lazy val publication: String = fields.get("publication").getOrElse("")
  lazy val lastModified: DateTime = fields("lastModified").parseISODateTime
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val shortUrlId: String = delegate.safeFields("shortUrl").replace("http://gu.com", "")
  lazy val webUrl: String = delegate.webUrl
  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val starRating: Option[String] = fields.get("starRating")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")
  lazy val allowUserGeneratedContent: Boolean = fields.get("allowUgc").exists(_.toBoolean)
  lazy val isCommentable: Boolean = fields.get("commentable").exists(_ == "true")
  lazy val isExpired = delegate.isExpired.getOrElse(false)
  lazy val blockVideoAds: Boolean = videoAssets.exists(_.blockVideoAds)
  lazy val isLiveBlog: Boolean = delegate.isLiveBlog
  lazy val isBlog: Boolean = blogs.nonEmpty
  lazy val isSeries: Boolean = series.nonEmpty
  lazy val hasLargeContributorImage: Boolean = tags.filter(_.hasLargeContributorImage).nonEmpty

  // read this before modifying
  // https://developers.facebook.com/docs/opengraph/howtos/maximizing-distribution-media-content#images
  lazy val openGraphImage: String = {

    def largest(i: ImageContainer) = i.largestImage.flatMap(_.url)

    mainPicture.flatMap(largest)
      .orElse(trailPicture.flatMap(largest))
      .getOrElse(facebook.imageFallback)
  }

  lazy val isSponsored: Boolean = tags.exists(_.id == "tone/sponsoredfeatures")
  lazy val sponsor: Option[Sponsor] = {
    if (isSponsored) {
      Sponsors.find(tags.filter(_.tagType == "keyword").head.id)
    } else {
      None
    }
  }

  lazy val isAdvertisementFeature: Boolean = tags.exists(_.id == "tone/advertisement-features")

  lazy val shouldHideAdverts: Boolean = fields.get("shouldHideAdverts").exists(_.toBoolean)

  lazy val witnessAssignment = delegate.references.find(_.`type` == "witness-assignment")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val cricketMatch: Option[String] = delegate.references.find(_.`type` == "esa-cricket-match")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val seriesMeta = {
    series.headOption.map( series =>
      Seq(("series", series.name), ("series-id", series.id))
    )getOrElse(Nil)
  }

  private lazy val fields: Map[String, String] = delegate.safeFields

  // Inherited from Trail
  override lazy val webPublicationDate: DateTime = delegate.webPublicationDate
  override lazy val linkText: String = webTitle
  override lazy val url: String = SupportedUrl(delegate)
  override lazy val section: String = delegate.sectionId.getOrElse("")
  override lazy val sectionName: String = delegate.sectionName.getOrElse("")
  override lazy val thumbnailPath: Option[String] = fields.get("thumbnail").map(ImgSrc(_, Naked))
  override lazy val isLive: Boolean = fields.get("liveBloggingNow").exists(_.toBoolean)
  override lazy val discussionId = Some(shortUrlPath)
  override lazy val isClosedForComments: Boolean = !fields.get("commentCloseDate").exists(_.parseISODateTime.isAfterNow)
  override lazy val leadingParagraphs: List[org.jsoup.nodes.Element] = {
    val body = delegate.safeFields.get("body")
    val souped = body flatMap { body =>
      val souped = Jsoup.parseBodyFragment(body).body().select("p")
      Option(souped) map { _.toList }
    }

    souped getOrElse Nil
  }

  lazy val wordCount: Int = {
    Jsoup.clean(delegate.safeFields.getOrElse("body",""), Whitelist.none()).split("\\s+").size
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
  override def metaData: Map[String, Any] = {

    super.metaData ++ Map(
    ("keywords", keywords.map { _.name }.mkString(",")),
    ("keywordIds", keywords.map { _.id }.mkString(",")),
    ("publication", publication),
    ("headline", headline),
    ("web-publication-date", webPublicationDate),
    ("author", contributors.map(_.name).mkString(",")),
    ("tones", tones.map(_.name).mkString(",")),
    ("blogs", blogs.map { _.name }.mkString(",")),
    ("commentable", isCommentable),
    ("has-story-package", fields.get("hasStoryPackage").exists(_.toBoolean)),
    ("page-code", fields("internalPageCode")),
    ("isLive", isLive),
    ("wordCount", wordCount),
    ("shortUrl", shortUrl),
    ("thumbnail", thumbnailPath.getOrElse(false)),
    ("references", delegate.references.map(r => Reference(r.id)))
    ) ++ Map(seriesMeta : _*)
  }
  override lazy val cacheSeconds = {
    if (isLive) 30 // live blogs can expect imminent updates
    else if (lastModified > DateTime.now - 1.hour) 60 // an hour gives you time to fix obvious typos and stuff
    else 900
  }
  override def openGraph: Map[String, Any] = super.openGraph ++ Map(
    "og:title" -> webTitle,
    "og:description" -> trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse("")
  )

  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:app:url:googleplay" -> webUrl.replace("http", "guardian")
  )

  override def elements: Seq[Element] = delegate.elements
      .map(_.zipWithIndex.map{ case (element, index) =>  Element(element, index)})
      .getOrElse(Nil)

  override lazy val headline: String = apiContent.metaData.get("headline").flatMap(_.asOpt[String]).getOrElse(fields("headline"))
  override lazy val trailText: Option[String] = apiContent.metaData.get("trailText").flatMap(_.asOpt[String]).orElse(fields.get("trailText"))
  override lazy val group: Option[String] = apiContent.metaData.get("group").flatMap(_.asOpt[String])
  override lazy val imageAdjust: String = apiContent.metaData.get("imageAdjust").flatMap(_.asOpt[String]).getOrElse("default")
  override lazy val isBreaking: Boolean = apiContent.metaData.get("isBreaking").flatMap(_.asOpt[Boolean]).getOrElse(false)
  override lazy val supporting: List[Content] = apiContent.supporting
}

object Content {

  def apply(apiContent: ApiContentWithMeta): Content = {
    apiContent.delegate match {
      // liveblog / article comes at the top of this list - it might be tagged with other types, but if so is treated as an article
      case liveBlog if apiContent.delegate.isLiveBlog => new LiveBlog(apiContent)
      case article if apiContent.delegate.isArticle || apiContent.delegate.isSudoku => new Article(apiContent)
      case gallery if apiContent.delegate.isGallery => new Gallery(apiContent)
      case video if apiContent.delegate.isVideo => new Video(apiContent)
      case picture if apiContent.delegate.isImageContent => new ImageContent(apiContent)
      case _ => new Content(apiContent)
    }
  }

  def apply(delegate: ApiContent, supporting: List[Content], metaData: Option[Map[String, JsValue]]): Content = {
    metaData match {
      case Some(meta) => apply(ApiContentWithMeta(delegate, supporting, meta))
      case _ => apply(ApiContentWithMeta(delegate))
    }
  }

  def apply(delegate: ApiContent): Content = apply(ApiContentWithMeta(delegate))

  def fromPressedJson(json: JsValue): Option[Content] = {
    val contentFields: Option[Map[String, String]] = (json \ "safeFields").asOpt[Map[String, String]]
    Option(
      Content(ApiContentWithMeta(
        ApiContent(
          id = (json \ "id").as[String],
          sectionId = (json \ "sectionId").asOpt[String],
          sectionName = (json \ "sectionName").asOpt[String],
          webPublicationDate = (json \ "webPublicationDate").asOpt[Long].map(new DateTime(_)).get,
          webTitle = (json \ "safeFields" \ "headline").as[String],
          webUrl = (json \ "webUrl").as[String],
          apiUrl = "",
          elements = Option(parseElements(json)),
          fields = contentFields,
          tags = (json \ "tags").asOpt[List[JsValue]].map(parseTags).getOrElse(Nil)
        ),
        supporting = (json \ "meta" \ "supporting").asOpt[List[JsValue]].getOrElse(Nil)
          .flatMap(Content.fromPressedJson),
        metaData = (json \ "meta").asOpt[Map[String, JsValue]].getOrElse(Map.empty)
      )
      )
    )
  }

  private def parseElements(json: JsValue): List[ApiElement] = {
    (json \ "elements").asOpt[List[JsValue]].map(_.map{ elementJson =>
        ApiElement(
        (elementJson \ "id").as[String],
        (elementJson \ "relation").as[String],
        (elementJson \ "type").as[String],
        (elementJson \ "galleryIndex").asOpt[Int],
        parseAssets(elementJson)
       )
    }).getOrElse(Nil)
  }

  private def parseTags(tagsJson: List[JsValue]): List[ApiTag] =
    tagsJson.map { tagJson =>
        ApiTag(
          id              = (tagJson \ "id").as[String],
          `type`          = (tagJson \ "type").as[String],
          sectionId       = (tagJson \ "section").asOpt[String],
          sectionName     = None,
          webTitle        = (tagJson \ "webTitle").as[String],
          webUrl          = (tagJson \ "webUrl").as[String],
          apiUrl          = "",
          references      = Nil,
          bio             = None,
          bylineImageUrl  = (tagJson \ "bylineImageUrl").asOpt[String]
      )
    }

  private def parseAssets(json: JsValue): List[Asset] = {
    (json \ "assets").asOpt[List[JsValue]].map(_.map{ assetJson =>
      Asset(
        (assetJson \ "type").as[String],
        (assetJson \ "mimeType").asOpt[String],
        (assetJson \ "file").asOpt[String],
        (assetJson \ "typeData").asOpt[Map[String, String]].getOrElse(Map.empty)
      )
    }).getOrElse(Nil)
  }
}

private object ArticleSchemas {
  def apply(article: Article): String = {
    // http://schema.org/Article
    // http://schema.org/Review
    if (article.isReview)
      "http://schema.org/Review"
    else if (article.isBlog)
      "http://schema.org/BlogPosting"
    else if (VisualTone(article) == VisualTone.News)
      "http://schema.org/NewsArticle"
    else
      "http://schema.org/Article"
  }
}

class Article(content: ApiContentWithMeta) extends Content(content) {
  lazy val body: String = delegate.safeFields.getOrElse("body","")
  lazy val contentType = "Article"
  lazy val isReview = tones.exists(_.id == "tone/reviews")

  lazy val hasVideoAtTop: Boolean = Jsoup.parseBodyFragment(body).body().children().headOption
    .exists(e => e.hasClass("gu-video") && e.tagName() == "video")

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override def schemaType = Some(ArticleSchemas(this))

  // if you change these rules make sure you update IMAGES.md (in this project)
  override def trailPicture: Option[ImageContainer] = thumbnail.find(_.imageCrops.exists(_.width >= 620))
      .orElse(mainPicture).orElse(videos.headOption)


  lazy val linkCounts = LinkTo.countLinks(body) + standfirst.map(LinkTo.countLinks).getOrElse(LinkCounts.None)
  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    ("content-type", contentType),
    ("isLiveBlog", isLiveBlog),
    ("inBodyInternalLinkCount", linkCounts.internal),
    ("inBodyExternalLinkCount", linkCounts.external),
    ("shouldHideAdverts", shouldHideAdverts)
  )

  override def openGraph: Map[String, Any] = super.openGraph ++ Map(
    "og:type" -> "article",
    "article:published_time" -> webPublicationDate,
    "article:modified_time" -> lastModified,
    "article:section" -> sectionName,
    "article:publisher" -> "https://www.facebook.com/theguardian",
    "og:image" -> openGraphImage
  ) ++ tags.map("article:tag" -> _.name) ++
    tags.filter(_.isContributor).map("article:author" -> _.webUrl)

  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "summary_large_image"
  ) ++ mainPicture.flatMap(_.largestImage.map( "twitter:image:src" -> _.path ))
}

class LiveBlog(content: ApiContentWithMeta) extends Article(content) {
  private lazy val soupedBody = Jsoup.parseBodyFragment(body).body()
  lazy val blockCount: Int = soupedBody.select(".block").size()
  lazy val summary: Option[String] = soupedBody.select(".is-summary").headOption.map(_.toString)
  lazy val groupedBlocks: List[String]= soupedBody.select(".block").toList.grouped(5).map { group =>
    group.map(_.toString).mkString
  }.toList
  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "summary"
  )
}

class Video(content: ApiContentWithMeta) extends Content(content) {

  private implicit val ordering = EncodingOrdering

  lazy val encodings: Seq[Encoding] = {
    videoAssets.toList.collect {
      case video: VideoAsset => Encoding(video.url.getOrElse(""), video.mimeType.getOrElse(""))
    }.sorted
  }

  // if you change these rules make sure you update IMAGES.md (in this project)
  override def mainPicture: Option[ImageContainer] = (images ++ videos).find(_.isMain)

  lazy val duration: Int = videoAssets.headOption.map(_.duration).getOrElse(0)

  lazy val contentType = "Video"
  lazy val source: Option[String] = videoAssets.headOption.flatMap(_.source)

  // I know its not too pretty
  lazy val bylineWithSource: Option[String] = Some(Seq(
    byline,
    source.map{
      case "guardian.co.uk" => "theguardian.com"
      case other => s"Source: $other"
    }
  ).flatten.mkString(", ")).filter(_.nonEmpty)

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData +("content-type" -> contentType, "blockVideoAds" -> blockVideoAds, "source" -> source.getOrElse(""))

  override def openGraph: Map[String, Any] = super.openGraph ++ Map(
    "og:type" -> "video",
    "og:video:type" -> "text/html",
    "og:video:url" -> webUrl,
    "og:image" -> openGraphImage
  ) ++ tags.map("video:tag" -> _.name)
}

object Video {
  def apply(delegate: ApiContent): Video = new Video(ApiContentWithMeta(delegate))
}

class Gallery(content: ApiContentWithMeta) extends Content(content) {

  def apply(index: Int): ImageAsset = galleryImages(index).largestImage.get

  lazy val size = galleryImages.size
  lazy val contentType = "Gallery"
  lazy val landscapes = largestCrops.sortBy(_.index).filter(i => i.width > i.height)
  lazy val portraits = largestCrops.sortBy(_.index).filter(i => i.width < i.height)
  lazy val isInPicturesSeries = tags.exists(_.id == "lifeandstyle/series/in-pictures")

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType, "gallerySize" -> size)
  override lazy val openGraphImage: String = galleryImages.headOption.flatMap(_.largestImage.flatMap(_.url)).getOrElse(conf.Configuration.facebook.imageFallback)

  // if you change these rules make sure you update IMAGES.md (in this project)
  override def trailPicture: Option[ImageContainer] = thumbnail

  override def openGraph: Map[String, Any] = super.openGraph ++ Map(
    "og:type" -> "article",
    "article:published_time" -> webPublicationDate,
    "article:modified_time" -> lastModified,
    "article:section" -> sectionName,
    "og:image" -> openGraphImage
  ) ++ tags.map("article:tag" -> _.name) ++
    tags.filter(_.isContributor).map("article:author" -> _.webUrl)

  private lazy val galleryImages: Seq[ImageElement] = images.filter(_.isGallery)
  lazy val largestCrops: Seq[ImageAsset] = galleryImages.flatMap(_.largestImage)

  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "gallery",
    "twitter:title" -> linkText
  ) ++ largestCrops.sortBy(_.index).take(5).zipWithIndex.map{ case(image, index) =>
    s"twitter:image$index:src" -> image.path
  }
}

object Gallery {
  def apply(delegate: ApiContent): Gallery = new Gallery(ApiContentWithMeta(delegate))
}

class Interactive(content: ApiContentWithMeta) extends Content(content) {
  lazy val contentType = "Interactive"
  lazy val body: Option[String] = delegate.safeFields.get("body")
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
}

object Interactive {
  def apply(delegate: ApiContent): Interactive = new Interactive(ApiContentWithMeta(delegate))
}

class ImageContent(content: ApiContentWithMeta) extends Content(content) {

  lazy val contentType = "ImageContent"
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)

  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "photo"
  ) ++ mainPicture.flatMap(_.largestImage.map( "twitter:image:src" -> _.path ))
}

case class ApiContentWithMeta(delegate: ApiContent, supporting: List[Content] = Nil, metaData: Map[String, JsValue] = Map.empty)
