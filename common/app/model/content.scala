package model

import com.gu.openplatform.contentapi.model.{Asset, Content => ApiContent, Element => ApiElement, Tag => ApiTag}
import common.{LinkCounts, LinkTo, Reference}
import conf.Configuration.facebook
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import common.{LinkCounts, LinkTo, Reference}
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist
import org.scala_tools.time.Imports._
import play.api.libs.json.JsValue
import views.support.{ImgSrc, Naked, StripHtmlTagsAndUnescapeEntities}

import scala.collection.JavaConversions._

class Content protected (val apiContent: ApiContentWithMeta) extends Trail with MetaData {

  lazy val delegate: ApiContent = apiContent.delegate

  lazy val publication: String = fields.get("publication").getOrElse("")
  lazy val lastModified: DateTime = fields.get("lastModified").map(_.parseISODateTime).getOrElse(DateTime.now)
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val shortUrlId: String = delegate.safeFields("shortUrl").replace("http://gu.com", "")
  lazy val webUrl: String = delegate.webUrl
  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val starRating: Option[String] = fields.get("starRating")
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")
  lazy val allowUserGeneratedContent: Boolean = fields.get("allowUgc").exists(_.toBoolean)
  lazy val isExpired = delegate.isExpired.getOrElse(false)
  lazy val blockVideoAds: Boolean = videoAssets.exists(_.blockVideoAds)
  lazy val isBlog: Boolean = blogs.nonEmpty
  lazy val isSeries: Boolean = series.nonEmpty
  lazy val hasLargeContributorImage: Boolean = tags.filter(_.hasLargeContributorImage).nonEmpty
  lazy val isFromTheObserver: Boolean = publication == "The Observer"
  lazy val primaryKeyWordTag: Option[Tag] = tags.find(!_.isSectionTag)
  lazy val keywordTags: Seq[Tag] = keywords.filter(tag => !tag.isSectionTag)

  lazy val showInRelated: Boolean = delegate.safeFields.get("showInRelatedContent").exists(_ == "true")
  lazy val hasSingleContributor: Boolean = {
    (contributors.headOption, byline) match {
      case (Some(t), Some(b)) => contributors.length == 1 && t.name == b
      case _ => false
    }
  }
  lazy val hasTonalHeaderByline: Boolean = { visualTone == Tags.VisualTone.Comment && hasSingleContributor }

  // read this before modifying
  // https://developers.facebook.com/docs/opengraph/howtos/maximizing-distribution-media-content#images
  lazy val openGraphImage: String = {

    def largest(i: ImageContainer) = i.largestImage.flatMap(_.url)

    mainPicture.flatMap(largest)
      .orElse(trailPicture.flatMap(largest))
      .getOrElse(facebook.imageFallback)
  }

  lazy val shouldHideAdverts: Boolean = fields.get("shouldHideAdverts").exists(_.toBoolean)

  lazy val witnessAssignment = delegate.references.find(_.`type` == "witness-assignment")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val cricketMatch: Option[String] = delegate.references.find(_.`type` == "esa-cricket-match")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val isbn: Option[String] = delegate.references.find(_.`type` == "isbn")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val seriesMeta = {
    series.headOption.map( series =>
      Seq(("series", series.name), ("series-id", series.id))
    )getOrElse(Nil)
  }

  private lazy val fields: Map[String, String] = delegate.safeFields

  // Inherited from Trail
  override lazy val webPublicationDate: DateTime = delegate.webPublicationDateOption.getOrElse(DateTime.now)
  override lazy val linkText: String = webTitle
  override lazy val url: String = SupportedUrl(delegate)
  override lazy val section: String = delegate.sectionId.getOrElse("")
  override lazy val sectionName: String = delegate.sectionName.getOrElse("")
  override lazy val thumbnailPath: Option[String] = fields.get("thumbnail").map(ImgSrc(_, Naked))
  override lazy val isLive: Boolean = fields.get("liveBloggingNow").exists(_.toBoolean)
  override lazy val discussionId = Some(shortUrlPath)
  override lazy val isCommentable: Boolean = fields.get("commentable").exists(_.toBoolean)
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
  override lazy val description: Option[String] = trailText
  override lazy val headline: String = apiContent.metaData.get("headline").flatMap(_.asOpt[String]).getOrElse(fields("headline"))
  override lazy val trailText: Option[String] = apiContent.metaData.get("trailText").flatMap(_.asOpt[String]).orElse(fields.get("trailText"))
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
      ("references", delegate.references.map(r => Reference(r.id))),
      ("sectionName", sectionName)
    ) ++ Map(seriesMeta : _*)
  }

  override lazy val cacheSeconds = {
    if (isLive) 30 // live blogs can expect imminent updates
    else if (lastModified > DateTime.now - 1.hour) 60 // an hour gives you time to fix obvious typos and stuff
    else 900
  }
  override def openGraph: Map[String, Any] = super.openGraph ++ Map(
    "og:title" -> webTitle,
    "og:description" -> trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse(""),
    "og:image" -> openGraphImage
  )

  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:app:url:googleplay" -> webUrl.replace("http", "guardian")
  )

  override def elements: Seq[Element] = delegate.elements
      .map(imageElement ++: _)
      .map(_.zipWithIndex.map{ case (element, index) =>  Element(element, index)})
      .getOrElse(Nil)

  // Inherited from FaciaFields
  override lazy val group: Option[String] = apiContent.metaData.get("group").flatMap(_.asOpt[String])
  override lazy val supporting: List[Content] = apiContent.supporting
  override lazy val isBreaking: Boolean = apiContent.metaData.get("isBreaking").flatMap(_.asOpt[Boolean]).getOrElse(false)
  override lazy val imageAdjust: String = apiContent.metaData.get("imageAdjust").flatMap(_.asOpt[String]).getOrElse("default")
  override lazy val imageSrc: Option[String] = apiContent.metaData.get("imageSrc").flatMap(_.asOpt[String])
  override lazy val imageSrcWidth: Option[String] = apiContent.metaData.get("imageSrcWidth").flatMap(_.asOpt[String])
  override lazy val imageSrcHeight: Option[String] = apiContent.metaData.get("imageSrcHeight").flatMap(_.asOpt[String])
  lazy val imageElement: Option[ApiElement] = for {
    src <- imageSrc
    width <- imageSrcWidth
    height <- imageSrcHeight
  } yield ImageOverride.createElementWithOneAsset(src, width, height)
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
    val itemId: String = (json \ "id").as[String]
    if (itemId.startsWith("snap/")) {
      val snapMeta: Map[String, JsValue] = (json \ "meta").asOpt[Map[String, JsValue]].getOrElse(Map.empty)
      Option(
        new Snap(
          snapId = itemId,
          snapSupporting = (json \ "meta" \ "supporting").asOpt[List[JsValue]].getOrElse(Nil)
            .flatMap(Content.fromPressedJson),
          (json \ "webPublicationDate").asOpt[DateTime].getOrElse(DateTime.now),
          snapMeta = snapMeta,
          snapElements = parseElements(json)
        )
      )
    }
    else {
      Option(
        Content(ApiContentWithMeta(
          ApiContent(
            itemId,
            sectionId = (json \ "sectionId").asOpt[String],
            sectionName = (json \ "sectionName").asOpt[String],
            webPublicationDateOption = (json \ "webPublicationDate").asOpt[Long].map(new DateTime(_)),
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
    // http://schema.org/NewsArticle
    // http://schema.org/Review
    if (article.isReview)
      "http://schema.org/Review"
    else
      "http://schema.org/NewsArticle"
  }
}

object SnapApiContent {

  def apply(): ApiContent = ApiContent(
    id                           = "",
    sectionId                   = None,
    sectionName                 = None,
    webPublicationDateOption    = Some(DateTime.now),
    webTitle                    = "",
    webUrl                      = "http://www.theguardian.com/",
    apiUrl                      = "",
    fields                      = None,
    tags                        = Nil,
    factboxes                   = Nil,
    mediaAssets                 = Nil,
    elements                    = Option(Nil),
    references                  = Nil,
    isExpired                   = None
  )

  def apply(snapElements: List[ApiElement]): ApiContent = apply().copy(elements = Some(snapElements))
}

class Snap(snapId: String,
           snapSupporting: List[Content],
           snapWebPublicationDate: DateTime,
           snapMeta: Map[String, JsValue],
           snapElements: List[ApiElement] = Nil
            ) extends Content(new ApiContentWithMeta(SnapApiContent(snapElements), supporting = snapSupporting, metaData = snapMeta)) {

  val snapType: Option[String] = snapMeta.get("snapType").flatMap(_.asOpt[String])
  val snapCss: Option[String] = snapMeta.get("snapCss").flatMap(_.asOpt[String])
  val snapUri: Option[String] = snapMeta.get("snapUri").flatMap(_.asOpt[String])

  lazy val snapUrl: Option[String] = snapMeta.get("href").flatMap(_.asOpt[String])

  //We set this to snapId as TemplateDeduping uses this ID to dedupe
  override lazy val url: String = snapId

  //Sorting is done via id
  override lazy val id: String = snapId

  //Trail implementations
  override lazy val shortUrl: String = ""
  override lazy val headline: String = snapMeta.get("headline").flatMap(_.asOpt[String]).getOrElse("Link")

  //Meta implementations
  override lazy val webPublicationDate = snapWebPublicationDate
}

class Article(content: ApiContentWithMeta) extends Content(content) {
  lazy val main: String = delegate.safeFields.getOrElse("main","")
  lazy val body: String = delegate.safeFields.getOrElse("body","")
  override lazy val contentType = "Article"

  lazy val hasVideoAtTop: Boolean = Jsoup.parseBodyFragment(body).body().children().headOption
    .exists(e => e.hasClass("gu-video") && e.tagName() == "video")

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override def schemaType = Some(ArticleSchemas(this))

  // if you change these rules make sure you update IMAGES.md (in this project)
  override def trailPicture: Option[ImageContainer] = thumbnail.find(_.imageCrops.exists(_.width >= 620))
    .orElse(mainPicture).orElse(videos.headOption)

  lazy val linkCounts = LinkTo.countLinks(body) + standfirst.map(LinkTo.countLinks).getOrElse(LinkCounts.None)
  override lazy val metaData: Map[String, Any] = {
    val bookReviewIsbns = isbn.map { i: String => Map("isbn" -> i)}.getOrElse(Map())

    super.metaData ++ Map(
      ("content-type", contentType),
      ("isLiveBlog", isLiveBlog),
      ("inBodyInternalLinkCount", linkCounts.internal),
      ("inBodyExternalLinkCount", linkCounts.external),
      ("shouldHideAdverts", shouldHideAdverts)
    ) ++ bookReviewIsbns
  }

  override def openGraph: Map[String, Any] = super.openGraph ++ Map(
    ("og:type", "article"),
    ("article:published_time", webPublicationDate),
    ("article:modified_time", lastModified),
    ("article:tag", keywords.map(_.name).mkString(",")),
    ("article:section", sectionName),
    ("article:publisher", "https://www.facebook.com/theguardian"),
    ("article:author", contributors.map(_.webUrl).mkString(","))
  )

  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "summary_large_image"
  ) ++ mainPicture.flatMap(_.largestImage.map( "twitter:image:src" -> _.path ))
}

class LiveBlog(content: ApiContentWithMeta) extends Article(content) {
  private lazy val soupedBody = Jsoup.parseBodyFragment(body).body()
  lazy val hasKeyEvents: Boolean = soupedBody.select(".is-key-event").nonEmpty
  lazy val isSport: Boolean = tags.exists(_.id == "sport/sport")
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

  override lazy val contentType = "Video"
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
    "og:type" -> "video",
    "og:video:type" -> "text/html",
    "og:video:url" -> webUrl,
    "video:tag" -> keywords.map(_.name).mkString(",")
  )
}

object Video {
  def apply(delegate: ApiContent): Video = new Video(ApiContentWithMeta(delegate))
}

class Gallery(content: ApiContentWithMeta) extends Content(content) {

  def apply(index: Int): ImageAsset = galleryImages(index).largestImage.get

  lazy val size = galleryImages.size
  override lazy val contentType = "Gallery"
  lazy val landscapes = largestCrops.filter(i => i.width > i.height).sortBy(_.index)
  lazy val portraits = largestCrops.filter(i => i.width < i.height).sortBy(_.index)
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
    "article:tag" -> keywords.map(_.name).mkString(","),
    "article:author" -> contributors.map(_.webUrl).mkString(",")
  )

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
  override lazy val contentType = "Interactive"
  lazy val body: Option[String] = delegate.safeFields.get("body")
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)
}

object Interactive {
  def apply(delegate: ApiContent): Interactive = new Interactive(ApiContentWithMeta(delegate))
}

class ImageContent(content: ApiContentWithMeta) extends Content(content) {

  override lazy val contentType = "ImageContent"
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> contentType)

  override def cards: List[(String, Any)] = super.cards ++ List(
    "twitter:card" -> "photo"
  ) ++ mainPicture.flatMap(_.largestImage.map( "twitter:image:src" -> _.path ))
}

case class ApiContentWithMeta(delegate: ApiContent, supporting: List[Content] = Nil, metaData: Map[String, JsValue] = Map.empty)
