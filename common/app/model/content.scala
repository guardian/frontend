package model

import java.net.URL

import com.gu.facia.api.{utils => fapiutils}
import com.gu.facia.client.models.TrailMetaData
import com.gu.util.liveblogs.{Parser => LiveBlogParser}
import common.dfp.DfpAgent
import common._
import conf.Configuration
import conf.switches.Switches.{FacebookShareUseTrailPicFirstSwitch, LongCacheSwitch}
import cricketPa.CricketTeams
import layout.ContentWidths.GalleryMedia
import ophan.SurgingContentAgent
import org.joda.time.DateTime
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist
import org.scala_tools.time.Imports._
import play.api.libs.json._
import com.gu.contentapi.client.{model => contentapi}
import model.pressed._
import views.support.{ChaptersLinksCleaner, StripHtmlTagsAndUnescapeEntities, FacebookOpenGraphImage, ImgSrc, Item700}

import scala.collection.JavaConversions._
import scala.language.postfixOps
import scala.util.Try

sealed trait ContentType {
  def content: Content
  final def tags: Tags = content.tags
  final def elements: Elements = content.elements
  final def fields: Fields = content.fields
  final def trail: Trail = content.trail
  final def metadata: MetaData = content.metadata
  final def commercial: Commercial = content.commercial
  final def sharelinks: ShareLinks = content.sharelinks
}

final case class GenericContent(override val content: Content) extends ContentType

final case class Content(
  trail: Trail,
  metadata: MetaData,
  tags: Tags,
  commercial: Commercial,
  elements: Elements,
  fields: Fields,
  sharelinks: ShareLinks,
  publication: String,
  internalPageCode: String,
  contributorBio: Option[String],
  starRating: Option[Int],
  allowUserGeneratedContent: Boolean,
  isExpired: Boolean,
  productionOffice: Option[String],
  tweets: Seq[Tweet],
  showInRelated: Boolean,
  cardStyle: CardStyle,
  shouldHideAdverts: Boolean,
  witnessAssignment: Option[String],
  isbn: Option[String],
  imdb: Option[String],
  javascriptReferences: Seq[JsObject],
  wordCount: Int,
  showByline: Boolean,
  hasStoryPackage: Boolean,
  rawOpenGraphImage: String,
  showFooterContainers: Boolean = false
) {

  lazy val isSurging: Seq[Int] = SurgingContentAgent.getSurgingLevelsFor(metadata.id)
  lazy val isBlog: Boolean = tags.blogs.nonEmpty
  lazy val isSeries: Boolean = tags.series.nonEmpty
  lazy val isFromTheObserver: Boolean = publication == "The Observer"
  lazy val primaryKeyWordTag: Option[Tag] = tags.tags.find(!_.isSectionTag)
  lazy val keywordTags: Seq[Tag] = tags.keywords.filter(tag => !tag.isSectionTag)
  lazy val shortUrlId = fields.shortUrl.replace("http://gu.com", "")
  lazy val shortUrlPath = shortUrlId
  lazy val discussionId = Some(shortUrlPath)

  lazy val hasSingleContributor: Boolean = {
    (tags.contributors.headOption, trail.byline) match {
      case (Some(t), Some(b)) => tags.contributors.length == 1 && t.name == b
      case _ => false
    }
  }

  lazy val hasTonalHeaderByline: Boolean = {
    (cardStyle == Comment || cardStyle == Editorial) &&
      hasSingleContributor &&
      metadata.contentType != GuardianContentTypes.ImageContent
  }

  lazy val hasBeenModified: Boolean =
    new Duration(trail.webPublicationDate, fields.lastModified).isLongerThan(Duration.standardSeconds(60))

  lazy val hasTonalHeaderIllustration: Boolean = tags.isLetters

  lazy val showCircularBylinePicAtSide: Boolean =
    cardStyle == Feature && tags.hasLargeContributorImage && tags.contributors.length == 1

  // read this before modifying: https://developers.facebook.com/docs/opengraph/howtos/maximizing-distribution-media-content#images
  lazy val openGraphImage: String = {
    ImgSrc(rawOpenGraphImage, FacebookOpenGraphImage)
  }

  lazy val syndicationType = {
    if(isBlog){
      "blog"
    } else if (tags.isGallery){
      "gallery"
    } else if(tags.isPodcast){
      "podcast"
    } else if (tags.isAudio){
      "audio"
    } else if(tags.isVideo){
      "video"
    } else {
      "article"
    }
  }

  lazy val contributorTwitterHandle: Option[String] = tags.contributors.headOption.flatMap(_.properties.twitterHandle)

  lazy val showSectionNotTag: Boolean = tags.tags.exists{ tag => tag.id == "childrens-books-site/childrens-books-site" && tag.properties.tagType == "blog" }

  lazy val sectionLabelLink : String = {
    if (showSectionNotTag || DfpAgent.isAdvertisementFeature(tags.tags, Some(metadata.section))) {
      metadata.section
    } else tags.tags.find(_.isKeyword) match {
      case Some(tag) => tag.id
      case _ => ""
    }
  }

  lazy val sectionLabelName : String = {
    if(this.showSectionNotTag) trail.sectionName else tags.tags.find(_.isKeyword) match {
      case Some(tag) => tag.metadata.webTitle
      case _ => ""
    }
  }

  lazy val blogOrSeriesTag: Option[Tag] = {
    tags.tags.find( tag => tag.showSeriesInMeta && (tag.isBlog || tag.isSeries )).headOption
  }

  lazy val seriesTag: Option[Tag] = {
    tags.blogs.find{tag => tag.id != "commentisfree/commentisfree"}.orElse(tags.series.headOption)
  }

  lazy val linkCounts = LinkTo.countLinks(fields.body) + fields.standfirst.map(LinkTo.countLinks).getOrElse(LinkCounts.None)

  lazy val hasMultipleVideosInPage: Boolean = mainVideoCanonicalPath match {
    case Some(_) => numberOfVideosInTheBody > 0
    case None => numberOfVideosInTheBody > 1
  }

  lazy val mainVideoCanonicalPath: Option[String] = Jsoup.parseBodyFragment(fields.main).body.getElementsByClass("element-video").headOption.map { v =>
    new URL(v.attr("data-canonical-url")).getPath.stripPrefix("/")
  }

  lazy val numberOfVideosInTheBody: Int = Jsoup.parseBodyFragment(fields.body).body().children().select("video[class=gu-video]").size()

  def javascriptConfig: Map[String, JsValue] = Map(
    ("publication", JsString(publication)),
    ("hasShowcaseMainElement", JsBoolean(elements.hasShowcaseMainElement)),
    ("hasStoryPackage", JsBoolean(hasStoryPackage)),
    ("pageCode", JsString(internalPageCode)),
    ("isContent", JsBoolean(true)),
    ("wordCount", JsNumber(wordCount)),
    ("references", JsArray(javascriptReferences)),
    ("showRelatedContent", JsBoolean(showInRelated)),
    ("productionOffice", JsString(productionOffice.getOrElse("")))
  )

  // Dynamic Meta Data may appear on the page for some content. This should be used for conditional metadata.
  def conditionalConfig: Map[String, JsValue] = {
    val rugbyMeta = if (tags.isRugbyMatch && conf.switches.Switches.RugbyScoresSwitch.isSwitchedOn) {
      val teamIds = tags.keywords.map(_.id).collect(RugbyContent.teamNameIds)
      val (team1, team2) = (teamIds.headOption.getOrElse(""), teamIds.lift(1).getOrElse(""))
      val date = RugbyContent.timeFormatter.withZoneUTC().print(trail.webPublicationDate)
      Some(("rugbyMatch", JsString(s"/sport/rugby/api/score/$date/$team1/$team2")))
    } else None

    val cricketMeta = if (tags.isCricketLiveBlog && conf.switches.Switches.CricketScoresSwitch.isSwitchedOn) {
      List(
        CricketTeams.teamFor(this).map(_.wordsForUrl).map(wordsForUrl => "cricketTeam" -> JsString(wordsForUrl)),
        Some(("cricketMatchDate", JsString(trail.webPublicationDate.withZone(DateTimeZone.UTC).toString("yyyy-MM-dd"))))
      )
    } else Nil

    val (seriesMeta, seriesIdMeta) = tags.series.filterNot{ tag => tag.id == "commentisfree/commentisfree"}.headOption.map { series =>
      (Some("series", JsString(series.name)), Some("seriesId", JsString(series.id)))
    } getOrElse (None,None)

    val meta = List[Option[(String, JsValue)]](
      rugbyMeta,
      seriesMeta,
      seriesIdMeta
    ) ++ cricketMeta
    meta.flatten.toMap
  }

  val opengraphProperties = Map(
    "og:title" -> metadata.webTitle,
    "og:description" -> fields.trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse(""),
    "og:image" -> openGraphImage
  )

  val twitterProperties = Map(
    "twitter:app:url:googleplay" -> metadata.webUrl.replace("http", "guardian"),
    "twitter:image" -> rawOpenGraphImage
  ) ++ contributorTwitterHandle.map(handle => "twitter:creator" -> s"@$handle").toList

}

object Content {

  def apply(apiContent: contentapi.Content): ContentType = {
    val content = make(apiContent)

    apiContent match {
      case article if apiContent.isLiveBlog || apiContent.isArticle || apiContent.isSudoku => Article.make(content)
      case gallery if apiContent.isGallery => Gallery.make(content)
      case video if apiContent.isVideo => Video.make(content)
      case audio if apiContent.isAudio => Audio.make(content)
      case picture if apiContent.isImageContent => ImageContent.make(content)
      case _ => GenericContent(content)
    }
  }

  def make(apiContent: contentapi.Content): Content = {

    val fields = Fields.make(apiContent)
    val metadata = MetaData.make(fields, apiContent)
    val elements = Elements.make(apiContent)
    val tags = Tags(apiContent.tags map { Tag.make(_) })
    val commercial = Commercial.make(metadata, tags, apiContent)
    val trail = Trail.make(tags, fields, commercial, elements, metadata, apiContent)
    val sharelinks = ShareLinks(tags, fields, metadata)
    val apifields = apiContent.safeFields
    val references: Map[String,String] = apiContent.references.map(ref => (ref.`type`, Reference.split(ref.id)._2)).toMap

    Content(
      elements = elements,
      tags = tags,
      fields = fields,
      metadata = metadata,
      trail = trail,
      commercial = commercial,
      sharelinks = sharelinks,
      publication = apifields.getOrElse("publication", ""),
      internalPageCode = apifields.getOrElse("internalPageCode", ""),
      contributorBio = apifields.get("contributorBio"),
      starRating = apifields.get("starRating").flatMap(s => Try(s.toInt).toOption),
      allowUserGeneratedContent = apifields.get("allowUgc").exists(_.toBoolean),
      isExpired = apiContent.isExpired.getOrElse(false),
      productionOffice = apifields.get("productionOffice"),
      tweets = apiContent.elements.getOrElse(Nil).filter(_.`type` == "tweet").map{ tweet =>
        val images = tweet.assets.filter(_.`type` == "image").map(_.file).flatten
        Tweet(tweet.id, images)
      },
      showInRelated = apifields.get("showInRelatedContent").contains("true"),
      cardStyle = CardStyle.make(fapiutils.CardStyle(apiContent, TrailMetaData.empty)),
      shouldHideAdverts = apifields.get("shouldHideAdverts").exists(_.toBoolean),
      witnessAssignment = references.get("witness-assignment"),
      isbn = references.get("isbn"),
      imdb = references.get("imdb"),
      javascriptReferences = apiContent.references.map(ref => Reference.toJavaScript(ref.id)),
      wordCount = {
        Jsoup.clean(fields.body, Whitelist.none()).split("\\s+").size
      },
      hasStoryPackage = apifields.get("hasStoryPackage").exists(_.toBoolean),
      showByline = {
        val cardStyle = fapiutils.CardStyle(apiContent, TrailMetaData.empty)
        fapiutils.ResolvedMetaData.fromContentAndTrailMetaData(apiContent, TrailMetaData.empty, cardStyle).showByline
      },
      rawOpenGraphImage = {
        val bestOpenGraphImage = if (FacebookShareUseTrailPicFirstSwitch.isSwitchedOn) {
          trail.trailPicture.flatMap(_.largestImageUrl)
        } else {
          None
        }
        bestOpenGraphImage
          .orElse(elements.mainPicture.flatMap(_.images.largestImageUrl))
          .orElse(trail.trailPicture.flatMap(_.largestImageUrl))
          .getOrElse(Configuration.images.fallbackLogo)
      }

    )
  }
}

private object ArticleSchemas {
  def apply(articleTags: Tags): String = {
    // http://schema.org/NewsArticle
    // http://schema.org/Review
    if (articleTags.isReview)
      "http://schema.org/Review"
    else if (articleTags.isLiveBlog)
      "http://schema.org/LiveBlogPosting"
    else
      "http://schema.org/NewsArticle"
  }
}

object Article {

  private def copyCommercial(content: Content) = {
    content.commercial.copy(
      hasInlineMerchandise = content.isbn.isDefined || content.commercial.hasInlineMerchandise)
  }

  private def copyTrail(content: Content) = {
    content.trail.copy(
      commercial = copyCommercial(content),
      trailPicture = content.elements.thumbnail.map(_.images)
        .find(_.imageCrops.exists(_.width >= 620))
        .orElse(content.elements.mainPicture.map(_.images))
        .orElse(content.elements.videos.headOption.map(_.images))
    )
  }

  private def copyMetaData(content: Content, commercial: Commercial, lightbox: GenericLightbox, trail: Trail, tags: Tags) = {

    val contentType = if (content.tags.isLiveBlog) GuardianContentTypes.LiveBlog else GuardianContentTypes.Article
    val section = content.metadata.section
    val id = content.metadata.id
    val fields = content.fields
    val bookReviewIsbn = content.isbn.map { i: String => Map("isbn" -> JsString(i)) }.getOrElse(Map())

    val javascriptConfig: Map[String, JsValue] = Map(
      ("contentType", JsString(contentType)),
      ("isLiveBlog", JsBoolean(content.tags.isLiveBlog)),
      ("inBodyInternalLinkCount", JsNumber(content.linkCounts.internal)),
      ("inBodyExternalLinkCount", JsNumber(content.linkCounts.external)),
      ("shouldHideAdverts", JsBoolean(content.shouldHideAdverts)),
      ("hasInlineMerchandise", JsBoolean(commercial.hasInlineMerchandise)),
      ("lightboxImages", lightbox.javascriptConfig),
      ("hasMultipleVideosInPage", JsBoolean(content.hasMultipleVideosInPage)),
      ("isImmersive", JsBoolean(content.metadata.isImmersive))
    ) ++ bookReviewIsbn

    val opengraphProperties: Map[String, String] = Map(
      ("og:type", "article"),
      ("article:published_time", trail.webPublicationDate.toString()),
      ("article:modified_time", content.fields.lastModified.toString()),
      ("article:tag", tags.keywords.map(_.name).mkString(",")),
      ("article:section", trail.sectionName),
      ("article:publisher", "https://www.facebook.com/theguardian"),
      ("article:author", tags.contributors.map(_.metadata.webUrl).mkString(","))
    )

    val twitterProperties: Map[String, String] = if (content.tags.isLiveBlog) {
      Map("twitter:card" -> "summary_large_image", "twitter:card" -> "summary")
    } else {
      Map("twitter:card" -> "summary_large_image")
    }

    content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}",
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      isImmersive = content.fields.displayHint.contains("immersive"),
      schemaType = Some(ArticleSchemas(content.tags)),
      cacheSeconds = if (LongCacheSwitch.isSwitchedOn) {
          if (fields.isLive) 5
          else if (fields.lastModified > DateTime.now(fields.lastModified.getZone) - 1.hour) 300
          else if (fields.lastModified > DateTime.now(fields.lastModified.getZone) - 24.hours) 1200
          else 1800
        } else {
          content.metadata.cacheSeconds
        },
      iosType = Some("Article"),
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties,
      twitterPropertiesOverrides = twitterProperties
    )
  }

  private def copyShareLinks(content: Content) = {
    if (content.tags.isLiveBlog) {
      content.sharelinks.copy(elementShareOrder = List("facebook", "twitter", "gplus"))
    } else {
      content.sharelinks
    }
  }

  // Perform a copy of the content object to enable Article to override Content.
  def make(content: Content): Article = {

    val fields = content.fields
    val elements = content.elements
    val tags = content.tags
    val trail = copyTrail(content)
    val commercial = copyCommercial(content)
    val lightboxProperties = GenericLightboxProperties(
      lightboxableCutoffWidth = 620,
      includeBodyImages = !tags.isLiveBlog,
      id = content.metadata.id,
      headline = trail.headline,
      shouldHideAdverts = content.shouldHideAdverts,
      standfirst = fields.standfirst)
    val lightbox = GenericLightbox(elements, fields, trail, lightboxProperties)
    val metadata = copyMetaData(content, commercial, lightbox, trail, tags)
    val sharelinks = copyShareLinks(content)

    val contentOverrides = content.copy(
      trail = trail,
      commercial = commercial,
      metadata = metadata,
      sharelinks = sharelinks,
      showFooterContainers = !tags.isLiveBlog && !content.shouldHideAdverts
    )

    Article(contentOverrides, lightboxProperties)
  }
}

final case class Article (
  override val content: Content,
  lightboxProperties: GenericLightboxProperties) extends ContentType {

  val lightbox = GenericLightbox(content.elements, content.fields, content.trail, lightboxProperties)

  val isLiveBlog: Boolean = content.tags.isLiveBlog
  val isImmersive: Boolean = content.metadata.isImmersive

  lazy val hasVideoAtTop: Boolean = soupedBody.body().children().headOption
    .exists(e => e.hasClass("gu-video") && e.tagName() == "video")

  lazy val hasSupporting: Boolean = {
    val supportingClasses = Set("element--showcase", "element--supporting", "element--thumbnail")
    val leftColElements = soupedBody.body().select("body > *").find(_.classNames.intersect(supportingClasses).size > 0)
    leftColElements.isDefined
  }

  lazy val chapterHeadings: Map[String, String] = {
    val jsoupChapterCleaner = ChaptersLinksCleaner.clean(soupedBody)
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

  private lazy val soupedBody = Jsoup.parseBodyFragment(fields.body)
  lazy val hasKeyEvents: Boolean = soupedBody.body().select(".is-key-event").nonEmpty
  lazy val isSport: Boolean = tags.tags.exists(_.id == "sport/sport")
  lazy val blocks = LiveBlogParser.parse(fields.body)
  lazy val mostRecentBlock: Option[String] = blocks.headOption.map(_.id)
}

object Audio {
  def make(content: Content): Audio = {

    val contentType = GuardianContentTypes.Audio
    val fields = content.fields
    val id = content.metadata.id
    val section = content.metadata.section
    val javascriptConfig: Map[String, JsValue] = Map(
      "contentType" -> JsString(contentType),
      "isPodcast" -> JsBoolean(content.tags.isPodcast))

    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}",
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      schemaType = Some("https://schema.org/AudioObject"),
      javascriptConfigOverrides = javascriptConfig
    )

    val contentOverrides = content.copy(
      metadata = metadata
    )

    Audio(contentOverrides)
  }
}

final case class Audio (override val content: Content) extends ContentType {

  lazy val downloadUrl: Option[String] = elements.mainAudio
    .flatMap(_.audio.encodings.find(_.format == "audio/mpeg").map(_.url.replace("static.guim", "download.guardian")))

  private lazy val podcastTag: Option[Tag] = tags.tags.find(_.properties.podcast.nonEmpty)
  lazy val iTunesSubscriptionUrl: Option[String] = podcastTag.flatMap(_.properties.podcast.flatMap(_.subscriptionUrl))
  lazy val seriesFeedUrl: Option[String] = podcastTag.map(tag => s"/${tag.id}/podcast.xml")
}

object Video {
  def make(content: Content): Video = {

    val contentType = GuardianContentTypes.Video
    val fields = content.fields
    val elements = content.elements
    val section = content.metadata.section
    val id = content.metadata.id
    val source: Option[String] = elements.videos.find(_.properties.isMain).flatMap(_.videos.source)

    val javascriptConfig: Map[String, JsValue] = Map(
      "contentType" -> JsString(contentType),
      "isPodcast" -> JsBoolean(content.tags.isPodcast),
      "source" -> JsString(source.getOrElse("")),
      "embeddable" -> JsBoolean(elements.videos.find(_.properties.isMain).map(_.videos.embeddable).getOrElse(false)),
      "videoDuration" -> elements.videos.find(_.properties.isMain).map{ v => JsNumber(v.videos.duration)}.getOrElse(JsNull))

    val opengraphProperties = Map(
      "og:type" -> "video",
      "og:video:type" -> "text/html",
      "og:video" -> content.metadata.webUrl,
      "video:tag" -> content.tags.keywords.map(_.name).mkString(",")
    )

    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}",
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      schemaType = Some("http://schema.org/VideoObject"),
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties,
      twitterPropertiesOverrides = Map("twitter:card" -> "summary_large_image")
    )

    val contentOverrides = content.copy(
      metadata = metadata
    )

    Video(contentOverrides, source)
  }
}

final case class Video (
  override val content: Content,
  source: Option[String] ) extends ContentType {

  lazy val bylineWithSource: Option[String] = Some(Seq(
    trail.byline,
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
    suffixVariations.fold(trail.headline.trim) { (str, suffix) => str.stripSuffix(suffix) }
  }
  def endSlatePath = EndSlateComponents.fromContent(content).toUriPath
}

object Gallery {
  def make(content: Content): Gallery = {

    val contentType = GuardianContentTypes.Gallery
    val fields = content.fields
    val elements = content.elements
    val tags = content.tags
    val section = content.metadata.section
    val id = content.metadata.id
    val lightboxProperties = GalleryLightboxProperties(
      id = id,
      headline = content.trail.headline,
      shouldHideAdverts = content.shouldHideAdverts,
      standfirst = fields.standfirst)
    val lightbox = GalleryLightbox(elements, tags, lightboxProperties)
    val javascriptConfig: Map[String, JsValue] = Map(
      "contentType" -> JsString(contentType),
      "gallerySize" -> JsNumber(lightbox.size),
      "lightboxImages" -> lightbox.javascriptConfig
    )
    val sharelinks = content.sharelinks.copy(
      elementShareOrder = List("facebook", "twitter", "pinterestBlock"),
      pageShareOrder = List("facebook", "twitter", "email", "pinterestPage", "gplus", "whatsapp")
    )
    val trail = content.trail.copy(
      trailPicture = elements.thumbnail.map(_.images))

    val openGraph: Map[String, String] = Map(
      "og:type" -> "article",
      "article:published_time" -> trail.webPublicationDate.toString,
      "article:modified_time" -> content.fields.lastModified.toString,
      "article:section" -> trail.sectionName,
      "article:tag" -> tags.keywords.map(_.name).mkString(","),
      "article:author" -> tags.contributors.map(_.metadata.webUrl).mkString(",")
    )

    val twitterProperties: Map[String, String] = Map(
      "twitter:card" -> "gallery",
      "twitter:title" -> fields.linkText
    ) ++ lightbox.largestCrops.sortBy(_.index).take(5).zipWithIndex.flatMap { case (image, index) =>
      image.path.map(i =>
        if (i.startsWith("//")) {
          s"twitter:image$index:src" -> s"http:$i"
        } else {
          s"twitter:image$index:src" -> i
        })
    }
    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}",
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      schemaType = Some("https://schema.org/ImageGallery"),
      openGraphImages = lightbox.openGraphImages,
      javascriptConfigOverrides = javascriptConfig,
      twitterPropertiesOverrides = twitterProperties,
      opengraphPropertiesOverrides = openGraph
    )

    val contentOverrides = content.copy(
      metadata = metadata,
      trail = trail,
      sharelinks = sharelinks,
      rawOpenGraphImage = {
        val bestOpenGraphImage = if (FacebookShareUseTrailPicFirstSwitch.isSwitchedOn) {
          trail.trailPicture.flatMap(_.largestImageUrl)
        } else {
          None
        }

        bestOpenGraphImage
          .orElse(lightbox.galleryImages.headOption.flatMap(_.images.largestImage.flatMap(_.url)))
          .getOrElse(conf.Configuration.images.fallbackLogo)
      }
    )

    Gallery(contentOverrides, lightboxProperties)
  }
}

final case class Gallery(
  override val content: Content,
  lightboxProperties: GalleryLightboxProperties) extends ContentType {

  val lightbox = GalleryLightbox(content.elements, content.tags, lightboxProperties)
  def apply(index: Int): ImageAsset = lightbox.galleryImages(index).images.largestImage.get
}

case class GalleryLightboxProperties(
  id: String,
  headline: String,
  shouldHideAdverts: Boolean,
  standfirst: Option[String])

case class GalleryLightbox(
  elements: Elements,
  tags: Tags,
  properties: GalleryLightboxProperties
){
  def imageContainer(index: Int): ImageElement = galleryImages(index)

  val galleryImages: Seq[ImageElement] = elements.images.filter(_.properties.isGallery)
  val largestCrops: Seq[ImageAsset] = galleryImages.flatMap(_.images.largestImage)
  val openGraphImages: Seq[String] = largestCrops.flatMap(_.url).map(ImgSrc(_, FacebookOpenGraphImage))
  val size = galleryImages.size
  val landscapes = largestCrops.filter(i => i.width > i.height).sortBy(_.index)
  val portraits = largestCrops.filter(i => i.width < i.height).sortBy(_.index)
  val isInPicturesSeries = tags.tags.exists(_.id == "lifeandstyle/series/in-pictures")

  val javascriptConfig: JsObject = {
    val imageJson = for {
      container <- galleryImages
      img <- container.images.largestEditorialCrop
    } yield {
      JsObject(Seq(
        "caption" -> JsString(img.caption.getOrElse("")),
        "credit" -> JsString(img.credit.getOrElse("")),
        "displayCredit" -> JsBoolean(img.displayCredit),
        "src" -> JsString(Item700.bestFor(container.images).getOrElse("")),
        "srcsets" -> JsString(ImgSrc.srcset(container.images, GalleryMedia.lightbox)),
        "sizes" -> JsString(GalleryMedia.lightbox.sizes),
        "ratio" -> Try(JsNumber(img.width.toDouble / img.height.toDouble)).getOrElse(JsNumber(1)),
        "role" -> JsString(img.role.toString)
      ))
    }
    JsObject(Seq(
      "id" -> JsString(properties.id),
      "headline" -> JsString(properties.headline),
      "shouldHideAdverts" -> JsBoolean(properties.shouldHideAdverts),
      "standfirst" -> JsString(properties.standfirst.getOrElse("")),
      "images" -> JsArray(imageJson)
    ))
  }
}

case class GenericLightboxProperties(
  id: String,
  headline: String,
  shouldHideAdverts: Boolean,
  standfirst: Option[String],
  lightboxableCutoffWidth: Int,
  includeBodyImages: Boolean)

case class GenericLightbox(
  elements: Elements,
  fields: Fields,
  trail: Trail,
  properties: GenericLightboxProperties
) {
  lazy val mainFiltered = elements.mainPicture
    .filter(_.images.largestEditorialCrop.map(_.ratio).getOrElse(0) > 0.7)
    .filter(_.images.largestEditorialCrop.map(_.width).getOrElse(1) > properties.lightboxableCutoffWidth).toSeq
  lazy val bodyFiltered: Seq[ImageElement] = elements.bodyImages.filter(_.images.largestEditorialCrop.map(_.width).getOrElse(1) > properties.lightboxableCutoffWidth).toSeq

  val lightboxImages = if (properties.includeBodyImages) mainFiltered ++ bodyFiltered else mainFiltered

  lazy val isMainMediaLightboxable = mainFiltered.nonEmpty

  lazy val javascriptConfig: JsObject = {
    val imageJson = for {
      container <- lightboxImages
      img <- container.images.largestEditorialCrop
    } yield {
      JsObject(Seq(
        "caption" -> JsString(img.caption.getOrElse("")),
        "credit" -> JsString(img.credit.getOrElse("")),
        "displayCredit" -> JsBoolean(img.displayCredit),
        "src" -> JsString(Item700.bestFor(container.images).getOrElse("")),
        "srcsets" -> JsString(ImgSrc.srcset(container.images, GalleryMedia.lightbox)),
        "sizes" -> JsString(GalleryMedia.lightbox.sizes),
        "ratio" -> Try(JsNumber(img.width.toDouble / img.height.toDouble)).getOrElse(JsNumber(1)),
        "role" -> JsString(img.role.toString)
      ))
    }
    JsObject(Seq(
      "id" -> JsString(properties.id),
      "headline" -> JsString(properties.headline),
      "shouldHideAdverts" -> JsBoolean(properties.shouldHideAdverts),
      "standfirst" -> JsString(properties.standfirst.getOrElse("")),
      "images" -> JsArray(imageJson)
    ))
  }
}

final case class Interactive(
  override val content: Content,
  maybeBody: Option[String]) extends ContentType {

  lazy val fallbackEl = {
    val noscriptEls = Jsoup.parseBodyFragment(fields.body).getElementsByTag("noscript")

    if (noscriptEls.length > 0) {
      noscriptEls.html()
    } else {
      Jsoup.parseBodyFragment(fields.body).getElementsByTag("figure").html()
    }
  }

  lazy val figureEl = maybeBody.map(Jsoup.parseBodyFragment(_).getElementsByTag("figure").html("").outerHtml())
}

object Interactive {
  def make(apiContent: contentapi.Content): Interactive = {
    val content = Content(apiContent).content
    val contentType = GuardianContentTypes.Interactive
    val fields = content.fields
    val elements = content.elements
    val tags = content.tags
    val section = content.metadata.section
    val id = content.metadata.id
    val twitterProperties: Map[String, String] = Map(
      "twitter:title" -> fields.linkText,
      "twitter:card" -> "summary_large_image"
    )
    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}",
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      isImmersive = fields.displayHint.contains("immersive"),
      javascriptConfigOverrides = Map("contentType" -> JsString(contentType)),
      twitterPropertiesOverrides = twitterProperties
    )
    val contentOverrides = content.copy(
      metadata = metadata
    )
    Interactive(
      contentOverrides,
      maybeBody = apiContent.safeFields.get("body"))
  }
}

object ImageContent {
  def make(content: Content): ImageContent = {
    val contentType = GuardianContentTypes.ImageContent
    val fields = content.fields
    val section = content.metadata.section
    val id = content.metadata.id
    val lightboxProperties = GenericLightboxProperties(
      lightboxableCutoffWidth = 940,
      includeBodyImages = false,
      id = id,
      headline = content.trail.headline,
      shouldHideAdverts = content.shouldHideAdverts,
      standfirst = fields.standfirst)
    val lightbox = GenericLightbox(content.elements, content.fields, content.trail, lightboxProperties)
    val javascriptConfig: Map[String, JsValue] = Map(
      "contentType" -> JsString(contentType),
      "lightboxImages" -> lightbox.javascriptConfig
    )
    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}",
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      isImmersive = fields.displayHint.contains("immersive"),
      javascriptConfigOverrides = javascriptConfig,
      twitterPropertiesOverrides = Map("twitter:card" -> "photo")
    )

    val contentOverrides = content.copy(
      metadata = metadata
    )
    ImageContent(contentOverrides, lightboxProperties)
  }
}

final case class ImageContent(
  override val content: Content,
  lightboxProperties: GenericLightboxProperties ) extends ContentType {

  val lightBox = GenericLightbox(content.elements, content.fields, content.trail, lightboxProperties)
}

object CrosswordContent {
  def make(crossword: CrosswordData, apicontent: contentapi.Content) = {

    val content = Content(apicontent)
    val contentType= GuardianContentTypes.Crossword

    val metadata = content.metadata.copy(
      id = crossword.id,
      section = "crosswords",
      analyticsName = crossword.id,
      webTitle = crossword.name,
      contentType = contentType,
      iosType = None,
      javascriptConfigOverrides = Map("contentType" -> JsString(contentType))
    )

    val contentOverrides = content.content.copy(metadata = metadata)

    CrosswordContent(contentOverrides, crossword)
  }
}

final case class CrosswordContent(
  override val content: Content,
  crossword: CrosswordData ) extends ContentType

case class Tweet(id: String, images: Seq[String]) {
  val firstImage: Option[String] = images.headOption
}
