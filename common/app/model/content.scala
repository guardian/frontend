package model

import java.net.URL

import com.gu.contentapi.client.model.{Asset, Content => ApiContent, Element => ApiElement, Tag => ApiTag}
import com.gu.facia.api.utils._
import com.gu.facia.client.models.TrailMetaData
import com.gu.util.liveblogs.{Parser => LiveBlogParser}
import common.dfp.DfpAgent
import common.{LinkCounts, LinkTo, Reference}
import conf.Configuration.facebook
import conf.switches.Switches.{FacebookShareUseTrailPicFirstSwitch, SoftPurgeWithLongCachingSwitch}
import layout.ContentWidths.GalleryMedia
import ophan.SurgingContentAgent
import org.joda.time.DateTime
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist
import org.scala_tools.time.Imports._
import play.api.libs.json._
import views.support._
import com.gu.contentapi.client.{model => contentapi}

import scala.collection.JavaConversions._
import scala.language.postfixOps
import scala.util.Try

/**
 * a combination of CAPI content and things from facia tool, in one place
 */
class Content protected (val delegate: contentapi.Content) extends Trail with MetaData with ShareLinks {

  lazy val publication: String = fields.getOrElse("publication", "")
  lazy val lastModified: DateTime = fields.get("lastModified").map(_.parseISODateTime).getOrElse(DateTime.now)
  lazy val internalPageCode: String = delegate.safeFields("internalPageCode")
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val shortUrlId: String = delegate.safeFields("shortUrl").replace("http://gu.com", "")
  override lazy val webUrl: String = delegate.webUrl
  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val contributorBio: Option[String] = fields.get("contributorBio")
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
  lazy val displayHint: String = fields.getOrElse("displayHint", "")

  lazy val tweets: Seq[Tweet] = delegate.elements.getOrElse(Nil).filter(_.`type` == "tweet").map{ tweet =>
    val images = tweet.assets.filter(_.`type` == "image").map(_.file).flatten
    Tweet(tweet.id, images)
  }
  override lazy val membershipAccess: Option[String] = fields.get("membershipAccess")
  override lazy val requiresMembershipAccess: Boolean = {
    conf.switches.Switches.MembersAreaSwitch.isSwitchedOn && membershipAccess.nonEmpty && url.contains("/membership/")
  }

  lazy val showInRelated: Boolean = delegate.safeFields.get("showInRelatedContent").contains("true")
  lazy val hasSingleContributor: Boolean = {
    (contributors.headOption, byline) match {
      case (Some(t), Some(b)) => contributors.length == 1 && t.name == b
      case _ => false
    }
  }

  lazy val cardStyle: CardStyle = CardStyle.apply(delegate, TrailMetaData.empty)

  lazy val hasTonalHeaderByline: Boolean = {
    (cardStyle == Comment || cardStyle == Editorial) &&
      hasSingleContributor &&
      contentType != GuardianContentTypes.ImageContent
  }

  lazy val hasBeenModified: Boolean = {
    new Duration(webPublicationDate, lastModified).isLongerThan(Duration.standardSeconds(60))
  }

  lazy val hasTonalHeaderIllustration: Boolean = isLetters

  lazy val showCircularBylinePicAtSide: Boolean =
    cardStyle == Feature && hasLargeContributorImage && contributors.length == 1

  private def largestImageUrl(i: ImageContainer) = i.largestImage.flatMap(_.url)

  protected def bestOpenGraphImage: Option[String] = {
    if (FacebookShareUseTrailPicFirstSwitch.isSwitchedOn) {
      trailPicture.flatMap(largestImageUrl)
    } else {
      None
    }
  }

  // read this before modifying
  // https://developers.facebook.com/docs/opengraph/howtos/maximizing-distribution-media-content#images
  lazy val openGraphImage: String = ImgSrc(rawOpenGraphImage, FacebookOpenGraphImage)

  private lazy val rawOpenGraphImage: String = bestOpenGraphImage
    .orElse(mainPicture.flatMap(largestImageUrl))
    .orElse(trailPicture.flatMap(largestImageUrl))
    .getOrElse(facebook.imageFallback)

  lazy val shouldHideAdverts: Boolean = fields.get("shouldHideAdverts").exists(_.toBoolean)
  override lazy val isInappropriateForSponsorship: Boolean = fields.get("isInappropriateForSponsorship").exists(_.toBoolean)

  lazy val references = delegate.references.map(ref => (ref.`type`, Reference(ref.id)._2)).toMap

  lazy val witnessAssignment = references.get("witness-assignment")
  lazy val isbn: Option[String] = references.get("isbn")
  lazy val imdb: Option[String] = references.get("imdb")

  lazy val syndicationType = {
    if(isBlog){
      "blog"
    } else if (isGallery){
      "gallery"
    } else if(isPodcast){
      "podcast"
    } else if (isAudio){
      "audio"
    } else if(isVideo){
      "video"
    } else {
      "article"
    }
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

  // draft content may not have a headline. In that case just go with empty. We expect live content to have a headline
  override lazy val headline: String = fields.getOrDefault("headline", "")

  override lazy val trailText: Option[String] = fields.get("trailText")
  // old bylines can have html http://content.guardianapis.com/commentisfree/2012/nov/10/cocoa-chocolate-fix-under-threat?show-fields=byline
  override lazy val byline: Option[String] = fields.get("byline").map(stripHtml)
  override val showByline = resolvedMetaData.showByline

  override def isSurging: Seq[Int] = SurgingContentAgent.getSurgingLevelsFor(id)

  // Static Meta Data used by plugins on the page. People (including 3rd parties) rely on the names of these things,
  // think carefully before changing them.
  override def metaData: Map[String, JsValue] = {
    super.metaData ++ Map(
      ("keywords", JsString(keywords.map { _.name }.mkString(","))),
      ("keywordIds", JsString(keywords.map { _.id }.mkString(","))),
      ("nonKeywordTagIds", JsString(nonKeywordTags.map { _.id }.mkString(","))),
      ("richLink", JsString(richLink.getOrElse(""))),
      ("openModule", JsString(openModule.getOrElse(""))),
      ("publication", JsString(publication)),
      ("headline", JsString(headline)),
      ("webPublicationDate", Json.toJson(webPublicationDate)),
      ("author", JsString(contributors.map(_.name).mkString(","))),
      ("authorIds", JsString(contributors.map(_.id).mkString(","))),
      ("hasShowcaseMainElement", JsBoolean(hasShowcaseMainElement)),
      ("tones", JsString(tones.map(_.name).mkString(","))),
      ("toneIds", JsString(tones.map(_.id).mkString(","))),
      ("blogs", JsString(blogs.map { _.name }.mkString(","))),
      ("blogIds", JsString(blogs.map(_.id).mkString(","))),
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
    ) ++ conditionalMetaData
  }

  // Dynamic Meta Data may appear on the page for some content. This should be used for conditional metadata.
  private def conditionalMetaData: Map[String, JsValue] = {
    val rugbyMeta = if (isRugbyMatch) {
      val teamIds = keywords.map(_.id).collect(RugbyContent.teamNameIds)
      val (team1, team2) = (teamIds.headOption.getOrElse(""), teamIds.lift(1).getOrElse(""))
      val date = RugbyContent.timeFormatter.withZoneUTC().print(webPublicationDate)
      Some(("rugbyMatch", JsString(s"/sport/rugby/api/score/$date/$team1/$team2")))
    } else None

    val cricketMeta = if (isCricketLiveBlog && conf.switches.Switches.CricketScoresSwitch.isSwitchedOn) {
      Some(("cricketMatch", JsString(webPublicationDate.withZone(DateTimeZone.UTC).toString("yyyy-MM-dd"))))
    } else None

    val (seriesMeta, seriesIdMeta) = series.filterNot{ tag => tag.id == "commentisfree/commentisfree"}.headOption.map { series =>
      (Some("series", JsString(series.name)), Some("seriesId", JsString(series.id)))
    } getOrElse (None,None)

    val meta = List[Option[(String, JsValue)]](
      rugbyMeta,
      cricketMeta,
      seriesMeta,
      seriesIdMeta
    )

    meta.flatten.toMap
  }

  override def cacheSeconds = {
    if (isLive) 5
    else if (lastModified > DateTime.now(lastModified.getZone) - 1.hour) 10
    else if (lastModified > DateTime.now(lastModified.getZone) - 24.hours) 30
    else 300
  }

  override def openGraph: Map[String, String] = super.openGraph ++ Map(
    "og:title" -> webTitle,
    "og:description" -> trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse(""),
    "og:image" -> openGraphImage
  )

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:app:url:googleplay" -> webUrl.replace("http", "guardian"),
    "twitter:image" -> rawOpenGraphImage
  ) ++ contributorTwitterHandle.map(handle => "twitter:creator" -> s"@$handle").toList

  override def elements: Seq[Element] = delegate.elements
    .map(_.zipWithIndex.map { case (element, index) => Element(element, index) })
    .getOrElse(Nil)

  private lazy val resolvedMetaData: ResolvedMetaData = {
    val cardStyle = CardStyle(delegate, TrailMetaData.empty)
    ResolvedMetaData.fromContentAndTrailMetaData(delegate, TrailMetaData.empty, cardStyle)
  }

  lazy val contributorTwitterHandle: Option[String] = contributors.headOption.flatMap(_.twitterHandle)

  override lazy val adUnitSuffix: String = super.adUnitSuffix + "/" + contentType.toLowerCase

  lazy val showSectionNotTag: Boolean = tags.exists{ tag => tag.id == "childrens-books-site/childrens-books-site" && tag.tagType == "blog" }

  lazy val sectionLabelLink : String = {
    if (showSectionNotTag || DfpAgent.isAdvertisementFeature(tags, Some(section))) {
      section
    } else tags.find(_.isKeyword) match {
      case Some(tag) => tag.id
      case _ => ""
    }
  }

  lazy val sectionLabelName : String = {
    if(this.showSectionNotTag) sectionName else tags.find(_.isKeyword) match {
      case Some(tag) => tag.webTitle
      case _ => ""
    }
  }

  lazy val blogOrSeriesTag: Option[Tag] = {
    tags.find( tag => tag.showSeriesInMeta && (tag.isBlog || tag.isSeries )).headOption
  }

  lazy val seriesTag: Option[Tag] = {
    blogs.find{tag => tag.id != "commentisfree/commentisfree"}.orElse(series.headOption)
  }

  def showFooterContainers = false

  override def iosType = contentType match {
    case "Crossword" => None
    case _ => Some("Article")
  }
}

object Content {

  def apply(apiContent: contentapi.Content): Content = {
    apiContent match {
      // liveblog / article comes at the top of this list - it might be tagged with other types, but if so is treated as an article
      case liveBlog if apiContent.isLiveBlog => new LiveBlog(apiContent)
      case article if apiContent.isArticle || apiContent.isSudoku => new Article(apiContent)
      case gallery if apiContent.isGallery => new Gallery(apiContent)
      case video if apiContent.isVideo => new Video(apiContent)
      case audio if apiContent.isAudio => new Audio(apiContent)
      case picture if apiContent.isImageContent => new ImageContent(apiContent)
      case _ => new Content(apiContent)
    }
  }
}

private object ArticleSchemas {
  def apply(article: Article): String = {
    // http://schema.org/NewsArticle
    // http://schema.org/Review
    if (article.isReview)
      "http://schema.org/Review"
    else if (article.isLiveBlog)
      "http://schema.org/LiveBlogPosting"
    else
      "http://schema.org/NewsArticle"
  }
}

class Article(delegate: contentapi.Content) extends Content(delegate) with Lightboxable {
  lazy val main: String = delegate.safeFields.getOrElse("main","")
  lazy val body: String = delegate.safeFields.getOrElse("body","")
  override lazy val contentType = GuardianContentTypes.Article
  override lazy val isImmersive: Boolean = displayHint.contains("immersive")

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override def schemaType = Some(ArticleSchemas(this))

  // if you change these rules make sure you update IMAGES.md (in this project)
  override def trailPicture: Option[ImageContainer] = thumbnail.find(_.imageCrops.exists(_.width >= 620))
    .orElse(mainPicture).orElse(videos.headOption)

  override def hasInlineMerchandise = {
    isbn.isDefined || super.hasInlineMerchandise
  }

  override lazy val cacheSeconds = if (SoftPurgeWithLongCachingSwitch.isSwitchedOn) {
    if (isLive) 5
    else if (lastModified > DateTime.now(lastModified.getZone) - 1.hour) 300
    else if (lastModified > DateTime.now(lastModified.getZone) - 24.hours) 1200
    else 1200
  } else {
    super.cacheSeconds
  }

  lazy val hasVideoAtTop: Boolean = Jsoup.parseBodyFragment(body).body().children().headOption
    .exists(e => e.hasClass("gu-video") && e.tagName() == "video")

  lazy val mainVideoCanonicalPath: Option[String] = Jsoup.parseBodyFragment(main).body.getElementsByClass("element-video").headOption.map { v =>
    new URL(v.attr("data-canonical-url")).getPath.stripPrefix("/")
  }

  lazy val hasSupporting: Boolean = {
    val supportingClasses = Set("element--showcase", "element--supporting", "element--thumbnail")
    val leftColElements = Jsoup.parseBodyFragment(body).select("body > *").find(_.classNames.intersect(supportingClasses).size > 0)
    leftColElements.isDefined
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
      ("hasInlineMerchandise", JsBoolean(hasInlineMerchandise)),
      ("lightboxImages", lightbox)
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

  override def showFooterContainers = !isLiveBlog && !shouldHideAdverts

  lazy val chapterHeadings: Map[String, String] = {
    val jsoupBody = Jsoup.parseBodyFragment(body)
    val jsoupChapterCleaner = ChaptersLinksCleaner.clean(jsoupBody)
    val chapterElements = jsoupChapterCleaner.getElementsByClass("auto-chapter")
    chapterElements.map { el =>
      val headingElOpt = el.getElementsByTag("h2").headOption
      headingElOpt.flatMap { headingEl =>
        val attributes = headingEl.attributes()
        if(attributes.hasKey("id")) {
          Some((attributes.get("id"), headingEl.text()))
        } else None
      }
    }.flatten.toMap
  }
}

class LiveBlog(delegate: contentapi.Content) extends Article(delegate) {
  private lazy val soupedBody = Jsoup.parseBodyFragment(body).body()
  lazy val hasKeyEvents: Boolean = soupedBody.select(".is-key-event").nonEmpty
  lazy val isSport: Boolean = tags.exists(_.id == "sport/sport")
  override lazy val contentType = GuardianContentTypes.LiveBlog
  override protected lazy val elementShareOrder = List("facebook", "twitter", "gplus")

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:card" -> "summary"
  )

  override lazy val lightboxImages = mainFiltered

  lazy val blocks = LiveBlogParser.parse(body)
}

abstract class Media(delegate: contentapi.Content) extends Content(delegate) {

  lazy val body: Option[String] = delegate.safeFields.get("body")
  override def metaData: Map[String, JsValue] = super.metaData ++ Map("isPodcast" -> JsBoolean(isPodcast))

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override def openGraph: Map[String, String] = super.openGraph ++ Map(
    "og:type" -> "video",
    "og:type" -> "video",
    "og:video:type" -> "text/html",
    "og:video" -> webUrl,
    "video:tag" -> keywords.map(_.name).mkString(",")
  )
}

class Audio(delegate: contentapi.Content) extends Media(delegate) {

  override lazy val contentType = GuardianContentTypes.Audio

  override def schemaType = Some("https://schema.org/AudioObject")

  override lazy val metaData: Map[String, JsValue] =
    super.metaData ++ Map("contentType" -> JsString(contentType))

  lazy val downloadUrl: Option[String] = mainAudio
    .flatMap(_.encodings.find(_.format == "audio/mpeg").map(_.url.replace("static.guim", "download.guardian")))

  private lazy val podcastTag: Option[Tag] = tags.find(_.podcast.nonEmpty)
  lazy val iTunesSubscriptionUrl: Option[String] = podcastTag.flatMap(_.podcast.flatMap(_.subscriptionUrl))
  lazy val seriesFeedUrl: Option[String] = podcastTag.map(tag => s"/${tag.id}/podcast.xml")
}

object Audio {
  def apply(delegate: ApiContent): Audio = new Audio(delegate)
}

class Video(delegate: contentapi.Content) extends Media(delegate) {

  override lazy val contentType = GuardianContentTypes.Video

  lazy val source: Option[String] = videos.find(_.isMain).flatMap(_.source)

  override def schemaType = Some("http://schema.org/VideoObject")

  override lazy val metaData: Map[String, JsValue] =
    super.metaData ++ Map(
      "contentType" -> JsString(contentType),
      "source" -> JsString(source.getOrElse("")),
      "embeddable" -> JsBoolean(videos.find(_.isMain).map(_.embeddable).getOrElse(false)),
      "videoDuration" -> videos.find(_.isMain).map{ v => JsNumber(v.duration)}.getOrElse(JsNull)
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

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:card" -> "summary_large_image"
  )
}

object Video {
  def apply(delegate: ApiContent): Video = new Video(delegate)
}

class Gallery(delegate: contentapi.Content) extends Content(delegate) with Lightboxable {

  def apply(index: Int): ImageAsset = galleryImages(index).largestImage.get

  def imageContainer(index: Int): ImageElement = galleryImages(index)

  lazy val size = galleryImages.size
  override lazy val contentType = GuardianContentTypes.Gallery
  lazy val landscapes = largestCrops.filter(i => i.width > i.height).sortBy(_.index)
  lazy val portraits = largestCrops.filter(i => i.width < i.height).sortBy(_.index)
  lazy val isInPicturesSeries = tags.exists(_.id == "lifeandstyle/series/in-pictures")
  override protected lazy val pageShareOrder = List("facebook", "twitter", "email", "pinterestPage", "gplus", "whatsapp")
  override protected lazy val elementShareOrder = List("facebook", "twitter", "pinterestBlock")

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ Map(
    "contentType" -> JsString(contentType),
    "gallerySize" -> JsNumber(size),
    "lightboxImages" -> lightbox
  )

  override lazy val openGraphImage: String = {
    val imageUrl = bestOpenGraphImage
      .orElse(galleryImages.headOption.flatMap(_.largestImage.flatMap(_.url)))
      .getOrElse(conf.Configuration.facebook.imageFallback)

    ImgSrc(imageUrl, FacebookOpenGraphImage)
  }

  override def openGraphImages: Seq[String] = largestCrops.flatMap(_.url).map(ImgSrc(_, FacebookOpenGraphImage))

  override def schemaType = Some("http://schema.org/ImageGallery")

  // if you change these rules make sure you update IMAGES.md (in this project)
  override def trailPicture: Option[ImageContainer] = thumbnail

  override def openGraph: Map[String, String] = super.openGraph ++ Map(
    "og:type" -> "article",
    "article:published_time" -> webPublicationDate.toString,
    "article:modified_time" -> lastModified.toString,
    "article:section" -> sectionName,
    "article:tag" -> keywords.map(_.name).mkString(","),
    "article:author" -> contributors.map(_.webUrl).mkString(",")
  )

  lazy val galleryImages: Seq[ImageElement] = images.filter(_.isGallery)
  override lazy val lightboxImages = galleryImages
  lazy val largestCrops: Seq[ImageAsset] = galleryImages.flatMap(_.largestImage)

  override def cards: List[(String, String)] = super.cards ++ Seq(
    "twitter:card" -> "gallery",
    "twitter:title" -> linkText
  ) ++ largestCrops.sortBy(_.index).take(5).zipWithIndex.map { case (image, index) =>
    image.path.map( i =>
      if(i.startsWith("//")){
        s"twitter:image$index:src" -> s"http:$i"
      } else {
        s"twitter:image$index:src" -> i
      })
  }.flatten
}

object Gallery {
  def apply(delegate: ApiContent): Gallery = new Gallery(delegate)

}

trait Lightboxable extends Content {
  val lightboxableCutoffWidth = 620
  lazy val mainFiltered = mainPicture.filter(_.largestEditorialCrop.map(_.ratio).getOrElse(0) > 0.7).filter(_.largestEditorialCrop.map(_.width).getOrElse(1) > lightboxableCutoffWidth).toSeq
  lazy val bodyFiltered: Seq[ImageContainer] = bodyImages.filter(_.largestEditorialCrop.map(_.width).getOrElse(1) > lightboxableCutoffWidth).toSeq
  lazy val lightboxImages: Seq[ImageContainer] = mainFiltered ++ bodyFiltered

  lazy val isMainMediaLightboxable = !mainFiltered.isEmpty

  lazy val lightbox: JsObject = {

    val imageJson = for {
      container <- lightboxImages
      img <- container.largestEditorialCrop
    } yield {
      JsObject(Seq(
        "caption" -> JsString(img.caption.getOrElse("")),
        "credit" -> JsString(img.credit.getOrElse("")),
        "displayCredit" -> JsBoolean(img.displayCredit),
        "src" -> JsString(Item700.bestFor(container).getOrElse("")),
        "srcsets" -> JsString(ImgSrc.srcset(container, GalleryMedia.lightbox)),
        "sizes" -> JsString(GalleryMedia.lightbox.sizes),
        "ratio" -> Try(JsNumber(img.width.toDouble / img.height.toDouble)).getOrElse(JsNumber(1)),
        "role" -> JsString(img.role.toString)
      ))
    }

    JsObject(Seq(
      "id" -> JsString(id),
      "headline" -> JsString(headline),
      "shouldHideAdverts" -> JsBoolean(shouldHideAdverts),
      "standfirst" -> JsString(standfirst.getOrElse("")),
      "images" -> JsArray(imageJson)
    ))
  }

}

class Interactive(delegate: contentapi.Content) extends Content(delegate) {
  override lazy val contentType = GuardianContentTypes.Interactive
  lazy val body: Option[String] = delegate.safeFields.get("body")
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"

  override lazy val metaData: Map[String, JsValue] = super.metaData + ("contentType" -> JsString(contentType))
  override lazy val isImmersive: Boolean = displayHint.contains("immersive")
  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:title" -> linkText,
    "twitter:card" -> "summary_large_image"
  )

  lazy val fallbackEl = {
    val noscriptEls = Jsoup.parseBodyFragment(body.getOrElse("")).getElementsByTag("noscript")

    if (noscriptEls.length > 0) {
      noscriptEls.html()
    } else {
      Jsoup.parseBodyFragment(body.getOrElse("")).getElementsByTag("figure").html()
    }
  }

  lazy val figureEl = body.map(Jsoup.parseBodyFragment(_).getElementsByTag("figure").html("").outerHtml())

}

object Interactive {
  def apply(delegate: ApiContent): Interactive = new Interactive(delegate)
}

class ImageContent(delegate: contentapi.Content) extends Content(delegate) with Lightboxable {
  override val lightboxableCutoffWidth = 940
  override lazy val lightboxImages: Seq[ImageContainer] = mainFiltered
  override lazy val contentType = GuardianContentTypes.ImageContent
  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:card" -> "photo"
  )

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ Map(
    "contentType" -> JsString(contentType),
    "lightboxImages" -> lightbox
  )
}

case class Tweet(id: String, images: Seq[String]) {
  val firstImage: Option[String] = images.headOption
}
