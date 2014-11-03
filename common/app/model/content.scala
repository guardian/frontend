package model

import com.gu.facia.client.models.TrailMetaData
import com.gu.contentapi.client.model.{
  Asset, Content => ApiContent, Element => ApiElement, Tag => ApiTag, Podcast
}
import common.{LinkCounts, LinkTo, Reference}
import conf.Configuration.facebook
import fronts.MetadataDefaults
import ophan.SurgingContentAgent
import org.joda.time.DateTime
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist
import org.scala_tools.time.Imports._
import play.api.libs.json._
import views.support.{ImgSrc, Naked, StripHtmlTagsAndUnescapeEntities}
import conf.Switches.ContentCacheTimeSwitch
import com.gu.util.liveblogs.{Parser => LiveBlogParser, Block, BlockToText}

import scala.collection.JavaConversions._
import scala.language.postfixOps
import scala.util.Try

class Content protected (val apiContent: ApiContentWithMeta) extends Trail with MetaData with ShareLinks {

  lazy val delegate: ApiContent = apiContent.delegate

  lazy val snapType: Option[String] = apiContent.metaData.flatMap(_.snapType).filter(_.nonEmpty)
  lazy val snapCss: Option[String] = apiContent.metaData.flatMap(_.snapCss).filter(_.nonEmpty)
  lazy val snapUri: Option[String]  = apiContent.metaData.flatMap(_.snapUri).filter(_.nonEmpty)
  lazy val snapUrl: Option[String] = apiContent.metaData.flatMap(_.href).filter(_.nonEmpty)

  lazy val publication: String = fields.getOrElse("publication", "")
  lazy val lastModified: DateTime = fields.get("lastModified").map(_.parseISODateTime).getOrElse(DateTime.now)
  lazy val internalContentCode: String = delegate.safeFields("internalContentCode")
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val shortUrlId: String = delegate.safeFields("shortUrl").replace("http://gu.com", "")
  lazy val webUrl: String = delegate.webUrl
  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val starRating: Option[Int] = fields.get("starRating").flatMap(s => Try(s.toInt).toOption)
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")
  lazy val allowUserGeneratedContent: Boolean = fields.get("allowUgc").exists(_.toBoolean)
  lazy val isExpired = delegate.isExpired.getOrElse(false)
  lazy val isBlog: Boolean = blogs.nonEmpty
  lazy val isSeries: Boolean = series.nonEmpty
  lazy val isFromTheObserver: Boolean = publication == "The Observer"
  lazy val primaryKeyWordTag: Option[Tag] = tags.find(!_.isSectionTag)
  lazy val keywordTags: Seq[Tag] = keywords.filter(tag => !tag.isSectionTag)
  lazy val productionOffice: Option[String] = delegate.safeFields.get("productionOffice")

  lazy val showInRelated: Boolean = delegate.safeFields.get("showInRelatedContent").exists(_ == "true")
  lazy val hasSingleContributor: Boolean = {
    (contributors.headOption, byline) match {
      case (Some(t), Some(b)) => contributors.length == 1 && t.name == b
      case _ => false
    }
  }
  lazy val hasTonalHeaderByline: Boolean = { visualTone == Tags.VisualTone.Comment && hasSingleContributor }
  lazy val hasTonalHeaderIllustration: Boolean = isLetters
  lazy val showBylinePic: Boolean = {
    visualTone != Tags.VisualTone.News && hasLargeContributorImage && contributors.length == 1 && !hasTonalHeaderByline
  }

  // read this before modifying
  // https://developers.facebook.com/docs/opengraph/howtos/maximizing-distribution-media-content#images
  lazy val openGraphImage: String = {

    def largest(i: ImageContainer) = i.largestImage.flatMap(_.url)

    mainPicture.flatMap(largest)
      .orElse(trailPicture.flatMap(largest))
      .getOrElse(facebook.imageFallback)
  }

  lazy val shouldHideAdverts: Boolean = fields.get("shouldHideAdverts").exists(_.toBoolean)
  lazy val isInappropriateForSponsorship: Boolean = fields.get("isInappropriateForSponsorship").exists(_.toBoolean)

  lazy val witnessAssignment = delegate.references.find(_.`type` == "witness-assignment")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val isbn: Option[String] = delegate.references.find(_.`type` == "isbn")
    .map(_.id).map(Reference(_)).map(_._2)

  lazy val seriesMeta = {
    series.headOption.map( series =>
      Seq(("series", JsString(series.name)), ("seriesId", JsString(series.id)))
    ) getOrElse Nil
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
  override lazy val headline: String = apiContent.metaData.flatMap(_.headline).getOrElse(fields("headline"))
  override lazy val trailText: Option[String] = apiContent.metaData.flatMap(_.trailText).orElse(fields.get("trailText"))
  override lazy val byline: Option[String] = apiContent.metaData.flatMap(_.byline).orElse(fields.get("byline"))
  override val showByline = apiContent.metaData.flatMap(_.showByline).getOrElse(metaDataDefault("showByline"))

  override def isSurging: Seq[Int] = SurgingContentAgent.getSurgingLevelsFor(id)

  // Meta Data used by plugins on the page
  // people (including 3rd parties) rely on the names of these things, think carefully before changing them
  override def metaData: Map[String, JsValue] = {
    super.metaData ++ Map(
      ("keywords", JsString(keywords.map { _.name }.mkString(","))),
      ("keywordIds", JsString(keywords.map { _.id }.mkString(","))),
      ("publication", JsString(publication)),
      ("headline", JsString(headline)),
      ("webPublicationDate", Json.toJson(webPublicationDate)),
      ("author", JsString(contributors.map(_.name).mkString(","))),
      ("authorIds", JsString(contributors.map(_.id).mkString(","))),
      ("tones", JsString(tones.map(_.name).mkString(","))),
      ("toneIds", JsString(tones.map(_.id).mkString(","))),
      ("blogs", JsString(blogs.map { _.name }.mkString(","))),
      ("blogIds", JsString(blogs.map { _.id.split("/").last }.mkString(","))),
      ("commentable", JsBoolean(isCommentable)),
      ("hasStoryPackage", JsBoolean(fields.get("hasStoryPackage").exists(_.toBoolean))),
      ("pageCode", JsString(fields("internalPageCode"))),
      ("isLive", JsBoolean(isLive)),
      ("isContent", JsBoolean(true)),
      ("wordCount", JsNumber(wordCount)),
      ("shortUrl", JsString(shortUrl)),
      ("thumbnail", thumbnailPath.map(JsString.apply).getOrElse(JsBoolean(false))),
      ("references", JsArray(delegate.references.toSeq.map(ref => Reference.toJavaScript(ref.id)))),
      ("sectionName", JsString(sectionName)),
      ("showRelatedContent", JsBoolean(showInRelated)),
      ("productionOffice", JsString(productionOffice.getOrElse("")))
    ) ++ Map(seriesMeta: _*)
  }

  private lazy val defaultCacheTime = {
    if (isLive) 5
    else if (lastModified > DateTime.now(lastModified.getZone) - 1.hour) 60 // an hour gives you time to fix obvious typos and stuff
    else 900
  }

  private lazy val fastCacheTime = {
    if (isLive) 5
    else if (lastModified > DateTime.now(lastModified.getZone) - 1.hour) 10
    else if (lastModified > DateTime.now(lastModified.getZone) - 24.hours) 30
    else 300
  }

  override lazy val cacheSeconds = if (ContentCacheTimeSwitch.isSwitchedOn) fastCacheTime else defaultCacheTime

  override def openGraph: Map[String, String] = super.openGraph ++ Map(
    "og:title" -> webTitle,
    "og:description" -> trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse(""),
    "og:image" -> openGraphImage
  )

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:app:url:googleplay" -> webUrl.replace("http", "guardian")
  )

  override def elements: Seq[Element] = delegate.elements
    .map(imageElement ++: _)
    .map(_.zipWithIndex.map { case (element, index) => Element(element, index) })
    .getOrElse(Nil)

  private lazy val metaDataDefaults = MetadataDefaults(this)
  private def metaDataDefault(key: String) = metaDataDefaults.getOrElse(key, false)

  // Inherited from FaciaFields
  override lazy val group: Option[String] = apiContent.metaData.flatMap(_.group)
  override lazy val supporting: List[Content] = apiContent.supporting
  override lazy val isBoosted: Boolean = apiContent.metaData.flatMap(_.isBoosted).getOrElse(false)
  override lazy val imageHide: Boolean = apiContent.metaData.flatMap(_.imageHide).getOrElse(false)
  override lazy val isBreaking: Boolean = apiContent.metaData.flatMap(_.isBreaking).getOrElse(false)
  override lazy val showKickerCustom: Boolean = apiContent.metaData.flatMap(_.showKickerCustom).getOrElse(false)
  override lazy val customKicker: Option[String] = apiContent.metaData.flatMap(_.customKicker).filter(_.nonEmpty)
  override lazy val showBoostedHeadline: Boolean = apiContent.metaData.flatMap(_.showBoostedHeadline).getOrElse(false)

  override lazy val showQuotedHeadline: Boolean =
    apiContent.metaData.flatMap(_.showQuotedHeadline).getOrElse(metaDataDefault("showQuotedHeadline"))

  override lazy val imageReplace: Boolean = apiContent.metaData.flatMap(_.imageReplace).getOrElse(false)

  override lazy val showKickerTag: Boolean =
    apiContent.metaData.flatMap(_.showKickerTag).getOrElse(metaDataDefault("showKickerTag"))

  override lazy val showKickerSection: Boolean = apiContent.metaData.flatMap(_.showKickerSection).getOrElse(false)
  override lazy val imageSrc: Option[String] = apiContent.metaData.flatMap(_.imageSrc)
  override lazy val imageSrcWidth: Option[String] = apiContent.metaData.flatMap(_.imageSrcWidth)
  override lazy val imageSrcHeight: Option[String] = apiContent.metaData.flatMap(_.imageSrcHeight)
  lazy val imageElement: Option[ApiElement] = if (imageReplace) for {
    src <- imageSrc
    width <- imageSrcWidth
    height <- imageSrcHeight
  } yield ImageOverride.createElementWithOneAsset(src, width, height) else None

  override lazy val showMainVideo: Boolean =
    apiContent.metaData.flatMap(_.showMainVideo).getOrElse(metaDataDefault("showMainVideo"))

  override lazy val imageCutoutReplace: Boolean =
    apiContent.metaData.flatMap(_.imageCutoutReplace).getOrElse(metaDataDefault("imageCutoutReplace"))

  override lazy val customImageCutout: Option[FaciaImageElement] = for {
    src <- apiContent.metaData.flatMap(_.imageCutoutSrc)
    width <- apiContent.metaData.flatMap(_.imageCutoutSrcWidth).flatMap(s => Try(s.toInt).toOption)
    height <- apiContent.metaData.flatMap(_.imageCutoutSrcHeight).flatMap(s => Try(s.toInt).toOption)
  } yield FaciaImageElement(src, width, height)

  override lazy val adUnitSuffix: String = super.adUnitSuffix + "/" + contentType.toLowerCase

  lazy val isCommentIsFree: Boolean = tags.exists{ tag => tag.id == "commentisfree/commentisfree" && tag.tagType == "blog" }

  lazy val sectionLabelLink : String = {
    if(this.isCommentIsFree) section else tags.find(_.isKeyword) match {
      case Some(tag) => tag.id
      case _ => ""
    }
  }

  lazy val sectionLabelName : String = {
    if(this.isCommentIsFree) sectionName else tags.find(_.isKeyword) match {
      case Some(tag) => tag.webTitle
      case _ => ""
    }
  }

  lazy val seriesTag: Option[Tag] = {
    if(isSeries) series.headOption else blogs.find{tag => tag.id != "commentisfree/commentisfree"}
  }
}

object Content {

  def apply(apiContent: ApiContentWithMeta): Content = {
    apiContent.delegate match {
      // liveblog / article comes at the top of this list - it might be tagged with other types, but if so is treated as an article
      case liveBlog if apiContent.delegate.isLiveBlog => new LiveBlog(apiContent)
      case article if apiContent.delegate.isArticle || apiContent.delegate.isSudoku => new Article(apiContent)
      case gallery if apiContent.delegate.isGallery => new Gallery(apiContent)
      case video if apiContent.delegate.isVideo => new Video(apiContent)
      case audio if apiContent.delegate.isAudio => new Audio(apiContent)
      case picture if apiContent.delegate.isImageContent => new ImageContent(apiContent)
      case _ => new Content(apiContent)
    }
  }

  def apply(delegate: ApiContent, supporting: List[Content], metaData: Option[com.gu.facia.client.models.MetaDataCommonFields]): Content = {
    metaData match {
      case Some(meta) => apply(ApiContentWithMeta(delegate, supporting, metaData))
      case _ => apply(ApiContentWithMeta(delegate))
    }
  }

  def apply(delegate: ApiContent): Content = apply(ApiContentWithMeta(delegate))

  def fromPressedJson(json: JsValue): Option[Content] = {
    val contentFields: Option[Map[String, String]] = (json \ "safeFields").asOpt[Map[String, String]]
    val itemId: String = (json \ "id").as[String]
    if (Snap.isSnap(itemId)) {
      val snapMeta: Option[TrailMetaData] = (json \ "meta").asOpt[TrailMetaData]
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
          metaData = (json \ "meta").asOpt[TrailMetaData]
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
        bylineImageUrl  = (tagJson \ "bylineImageUrl").asOpt[String],
        bylineLargeImageUrl  = (tagJson \ "bylineLargeImageUrl").asOpt[String]
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
    elements                    = Option(Nil),
    references                  = Nil,
    isExpired                   = None
  )

  def apply(snapElements: List[ApiElement]): ApiContent = apply().copy(elements = Some(snapElements))
}

class Snap(snapId: String,
           snapSupporting: List[Content],
           snapWebPublicationDate: DateTime,
           snapMeta: Option[com.gu.facia.client.models.MetaDataCommonFields],
           snapElements: List[ApiElement] = Nil
            ) extends Content(new ApiContentWithMeta(SnapApiContent(snapElements), supporting = snapSupporting, metaData = snapMeta)) {

  //We set this to snapId as TemplateDeduping uses this ID to dedupe
  override lazy val url: String = snapId

  //Sorting is done via id
  override lazy val id: String = snapId

  //Trail implementations
  override lazy val shortUrl: String = ""
  override lazy val headline: String = apiContent.metaData.flatMap(_.headline).getOrElse("Link")

  //Meta implementations
  override lazy val webPublicationDate = snapWebPublicationDate
}

object Snap {
  def isSnap(id: String): Boolean = id.startsWith("snap/")
}

class Article(content: ApiContentWithMeta) extends Content(content) {
  lazy val main: String = delegate.safeFields.getOrElse("main","")
  lazy val body: String = delegate.safeFields.getOrElse("body","")
  override lazy val contentType = GuardianContentTypes.Article

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override def schemaType = Some(ArticleSchemas(this))

  // if you change these rules make sure you update IMAGES.md (in this project)
  override def trailPicture: Option[ImageContainer] = thumbnail.find(_.imageCrops.exists(_.width >= 620))
    .orElse(mainPicture).orElse(videos.headOption)

  override def hasInlineMerchandise = {
    isbn.isDefined || super.hasInlineMerchandise
  }

  lazy val hasVideoAtTop: Boolean = Jsoup.parseBodyFragment(body).body().children().headOption
    .exists(e => e.hasClass("gu-video") && e.tagName() == "video")

  lazy val hasSupportingAtBottom: Boolean = {
    val supportingClasses = Set("element--showcase", "element--supporting", "element--thumbnail")
    var wordCount = 0
    val lastEls = Jsoup.parseBodyFragment(body).select("body > *").reverseIterator.takeWhile{ el =>
      wordCount += el.text.length
      wordCount < 2000
    }
    val supportingEls = lastEls.find(_.classNames.intersect(supportingClasses).size > 0)
    supportingEls.isDefined
  }

  lazy val linkCounts = LinkTo.countLinks(body) + standfirst.map(LinkTo.countLinks).getOrElse(LinkCounts.None)

  override def metaData: Map[String, JsValue] = {
    val bookReviewIsbn = isbn.map { i: String => Map("isbn" -> JsString(i)) }.getOrElse(Map())

    super.metaData ++ Map(
      ("contentType", JsString(contentType)),
      ("isLiveBlog", JsBoolean(isLiveBlog)),
      ("inBodyInternalLinkCount", JsNumber(linkCounts.internal)),
      ("inBodyExternalLinkCount", JsNumber(linkCounts.external)),
      ("shouldHideAdverts", JsBoolean(shouldHideAdverts)),
      ("hasInlineMerchandise", JsBoolean(hasInlineMerchandise))
    ) ++ bookReviewIsbn
  }

  override def openGraph: Map[String, String] = super.openGraph ++ Map(
    ("og:type", "article"),
    ("article:published_time", webPublicationDate.toString()),
    ("article:modified_time", lastModified.toString()),
    ("article:tag", keywords.map(_.name).mkString(",")),
    ("article:section", sectionName),
    ("article:publisher", "https://www.facebook.com/theguardian"),
    ("article:author", contributors.map(_.webUrl).mkString(","))
  )

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:card" -> "summary_large_image"
  )
}

class LiveBlog(content: ApiContentWithMeta) extends Article(content) {
  private lazy val soupedBody = Jsoup.parseBodyFragment(body).body()
  lazy val hasKeyEvents: Boolean = soupedBody.select(".is-key-event").nonEmpty
  lazy val isSport: Boolean = tags.exists(_.id == "sport/sport")
  override lazy val contentType = GuardianContentTypes.LiveBlog

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:card" -> "summary"
  )

  override lazy val hasClassicVersion: Boolean = super.hasClassicVersion && !(section == "football")

  private lazy val cricketMetaData = if (isCricketLiveBlog) {
    Map(("cricketMatch", JsString(webPublicationDate.withZone(DateTimeZone.UTC).toString("yyyy-MM-dd"))))
  } else {
    Map()
  }

  override def metaData: Map[String, JsValue] = super.metaData ++ cricketMetaData

  lazy val latestUpdateText = LiveBlogParser.parse(body) collectFirst {
    case Block(_, _, _, _, BlockToText(text), _) if !text.trim.nonEmpty => text
  }
}

abstract class Media(content: ApiContentWithMeta) extends Content(content) {

  lazy val body: Option[String] = delegate.safeFields.get("body")
  override def metaData: Map[String, JsValue] = super.metaData ++ Map("isPodcast" -> JsBoolean(isPodcast))

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override def openGraph: Map[String, String] = super.openGraph ++ Map(
    "og:type" -> "video",
    "og:type" -> "video",
    "og:video:type" -> "text/html",
    "og:video:url" -> webUrl,
    "video:tag" -> keywords.map(_.name).mkString(",")
  )
}

class Audio(content: ApiContentWithMeta) extends Media(content) {

  override lazy val contentType = GuardianContentTypes.Audio

  override lazy val metaData: Map[String, JsValue] =
    super.metaData ++ Map("contentType" -> JsString(contentType))

  lazy val downloadUrl: Option[String] = mainAudio
    .flatMap(_.encodings.find(_.format == "audio/mpeg").map(_.url.replace("static.guim", "download.guardian")))

  private lazy val podcastTag: Option[Tag] = tags.find(_.podcast.nonEmpty)
  lazy val iTunesSubscriptionUrl: Option[String] = podcastTag.flatMap(_.podcast.flatMap(_.subscriptionUrl))
  lazy val seriesFeedUrl: Option[String] = podcastTag.map(tag => s"/${tag.id}/podcast.xml")
}

object Audio {
  def apply(delegate: ApiContent): Audio = new Audio(ApiContentWithMeta(delegate))
}

class Video(content: ApiContentWithMeta) extends Media(content) {

  override lazy val hasClassicVersion = false

  override lazy val contentType = GuardianContentTypes.Video

  lazy val source: Option[String] = videos.find(_.isMain).flatMap(_.source)

  override lazy val metaData: Map[String, JsValue] =
    super.metaData ++ Map(
      "contentType" -> JsString(contentType),
      "source" -> JsString(source.getOrElse(""))
    )

  // I know it's not too pretty
  lazy val bylineWithSource: Option[String] = Some(Seq(
    byline,
    source.map{
      case "guardian.co.uk" => "theguardian.com"
      case other => s"Source: $other"
    }
  ).flatten.mkString(", ")).filter(_.nonEmpty)

  lazy val videoLinkText: String = {
    val suffixVariations = List(
        " - video", " – video",
        " - video interview", " – video interview",
        " - video interviews"," – video interviews" )
    suffixVariations.fold(headline.trim) { (str, suffix) => str.stripSuffix(suffix) }
  }

  def endSlatePath = EndSlateComponents.fromContent(this).toUriPath
}

object Video {
  def apply(delegate: ApiContent): Video = new Video(ApiContentWithMeta(delegate))
}

class Gallery(content: ApiContentWithMeta) extends Content(content) {

  def apply(index: Int): ImageAsset = galleryImages(index).largestImage.get

  def imageContainer(index: Int): ImageElement = galleryImages(index)

  lazy val size = galleryImages.size
  override lazy val contentType = GuardianContentTypes.Gallery
  lazy val landscapes = largestCrops.filter(i => i.width > i.height).sortBy(_.index)
  lazy val portraits = largestCrops.filter(i => i.width < i.height).sortBy(_.index)
  lazy val isInPicturesSeries = tags.exists(_.id == "lifeandstyle/series/in-pictures")
  override protected lazy val pageShareOrder = List("facebook", "twitter", "email", "gplus", "whatsapp")

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ Map(
    "contentType" -> JsString(contentType),
    "gallerySize" -> JsNumber(size),
    "galleryLightbox" -> lightbox
  )

  override lazy val openGraphImage: String = galleryImages.headOption.flatMap(_.largestImage.flatMap(_.url)).getOrElse(conf.Configuration.facebook.imageFallback)

  override def schemaType = Some("http://schema.org/ImageGallery")

  // if you change these rules make sure you update IMAGES.md (in this project)
  override def trailPicture: Option[ImageContainer] = thumbnail

  override def openGraph: Map[String, String] = super.openGraph ++ Map(
    "og:type" -> "article",
    "article:published_time" -> webPublicationDate.toString(),
    "article:modified_time" -> lastModified.toString(),
    "article:section" -> sectionName,
    "article:tag" -> keywords.map(_.name).mkString(","),
    "article:author" -> contributors.map(_.webUrl).mkString(",")
  )

  lazy val galleryImages: Seq[ImageElement] = images.filter(_.isGallery)
  lazy val largestCrops: Seq[ImageAsset] = galleryImages.flatMap(_.largestImage)

  override def cards: List[(String, String)] = super.cards ++ Seq(
    "twitter:card" -> "gallery",
    "twitter:title" -> linkText
  ) ++ largestCrops.sortBy(_.index).take(5).zipWithIndex.map { case (image, index) =>
    image.path.map(s"twitter:image$index:src" ->)
  }.flatten

  lazy val lightbox: JsObject = {
    val imageContainers = galleryImages.filter(_.isGallery)
    val imageJson = imageContainers.map{ imgContainer =>
      imgContainer.largestEditorialCrop.map { img =>
        JsObject(Seq(
          "caption" -> JsString(img.caption.getOrElse("")),
          "credit" -> JsString(img.credit.getOrElse("")),
          "displayCredit" -> JsBoolean(img.displayCredit),
          "src" -> JsString(ImgSrc(img.url.getOrElse(""), ImgSrc.Imager)),
          "ratio" -> JsNumber(img.width.toFloat / img.height)
        ))
      }
    }
    JsObject(Seq(
      "id" -> JsString(id),
      "headline" -> JsString(headline),
      "shouldHideAdverts" -> JsBoolean(shouldHideAdverts),
      "standfirst" -> JsString(standfirst.getOrElse("")),
      "images" -> JsArray(imageJson.flatten)
    ))
  }
}

object Gallery {
  def apply(delegate: ApiContent): Gallery = new Gallery(ApiContentWithMeta(delegate))

}

class Interactive(content: ApiContentWithMeta) extends Content(content) {
  override lazy val contentType = GuardianContentTypes.Interactive
  lazy val body: Option[String] = delegate.safeFields.get("body")
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"

  override lazy val metaData: Map[String, JsValue] = super.metaData + ("contentType" -> JsString(contentType))
}

object Interactive {
  def apply(delegate: ApiContent): Interactive = new Interactive(ApiContentWithMeta(delegate))
}

class ImageContent(content: ApiContentWithMeta) extends Content(content) {

  override lazy val contentType = GuardianContentTypes.ImageContent
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"

  override lazy val metaData: Map[String, JsValue] =
    super.metaData + ("contentType" -> JsString(contentType))

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:card" -> "photo"
  )
}

case class ApiContentWithMeta(
  delegate: ApiContent,
  supporting: List[Content] = Nil,
  metaData: Option[com.gu.facia.client.models.MetaDataCommonFields] = None)
