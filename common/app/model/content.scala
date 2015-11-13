package model

import java.net.URL

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

case class GenericContent(override val content: Content) extends ContentType

case class Content(
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
  resolvedMetaData: ResolvedMetaData,
  hasStoryPackage: Boolean,
  rawOpenGraphImage: String,
  showFooterContainers: Boolean = false,
  javascriptConfigOverrides: Map[String, JsValue] = Map(),
  opengraphPropertiesOverrides: Map[String, String] = Map(),
  twitterPropertiesOverrides: Map[String, String] = Map()
) {


  lazy val isSurging: Seq[Int] = SurgingContentAgent.getSurgingLevelsFor(fields.id)
  lazy val showByline = resolvedMetaData.showByline

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

  lazy val contributorTwitterHandle: Option[String] = tags.contributors.headOption.flatMap(_.twitterHandle)

  lazy val showSectionNotTag: Boolean = tags.tags.exists{ tag => tag.id == "childrens-books-site/childrens-books-site" && tag.tagType == "blog" }

  lazy val sectionLabelLink : String = {
    if (showSectionNotTag || DfpAgent.isAdvertisementFeature(tags.tags, Some(fields.section))) {
      fields.section
    } else tags.tags.find(_.isKeyword) match {
      case Some(tag) => tag.id
      case _ => ""
    }
  }

  lazy val sectionLabelName : String = {
    if(this.showSectionNotTag) trail.sectionName else tags.tags.find(_.isKeyword) match {
      case Some(tag) => tag.webTitle
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

  // The order of construction is important, overrides must come last.
  def getJavascriptConfig: Map[String, JsValue] =
    fields.javascriptConfig ++
    metadata.javascriptConfig ++
    tags.javascriptConfig ++
    trail.javascriptConfig ++
    commercial.javascriptConfig ++
    conditionalConfig ++
    javascriptConfig ++
    javascriptConfigOverrides


  private def javascriptConfig: Map[String, JsValue] = Map(
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
  private def conditionalConfig: Map[String, JsValue] = {
    val rugbyMeta = if (tags.isRugbyMatch && conf.switches.Switches.RugbyScoresSwitch.isSwitchedOn) {
      val teamIds = tags.keywords.map(_.id).collect(RugbyContent.teamNameIds)
      val (team1, team2) = (teamIds.headOption.getOrElse(""), teamIds.lift(1).getOrElse(""))
      val date = RugbyContent.timeFormatter.withZoneUTC().print(trail.webPublicationDate)
      Some(("rugbyMatch", JsString(s"/sport/rugby/api/score/$date/$team1/$team2")))
    } else None

    val cricketMeta = if (tags.isCricketLiveBlog && conf.switches.Switches.CricketScoresSwitch.isSwitchedOn) {
      Some(("cricketMatch", JsString(trail.webPublicationDate.withZone(DateTimeZone.UTC).toString("yyyy-MM-dd"))))
    } else None

    val (seriesMeta, seriesIdMeta) = tags.series.filterNot{ tag => tag.id == "commentisfree/commentisfree"}.headOption.map { series =>
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

  def getOpenGraph: Map[String, String] = Map(
    "og:title" -> fields.webTitle,
    "og:description" -> fields.trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse(""),
    "og:image" -> openGraphImage
  ) ++ opengraphPropertiesOverrides

  def getTwitterProperties: Map[String, String] = Map(
    "twitter:app:url:googleplay" -> fields.webUrl.replace("http", "guardian"),
    "twitter:image" -> rawOpenGraphImage
  ) ++ contributorTwitterHandle.map(handle => "twitter:creator" -> s"@$handle").toList ++ twitterPropertiesOverrides
}

object Content {

  def apply(apiContent: contentapi.Content): ContentType = {
    val content = constructContent(apiContent)

    apiContent match {
      case article if apiContent.isLiveBlog || apiContent.isArticle || apiContent.isSudoku => Article.make(content)
      case gallery if apiContent.isGallery => Gallery.make(content)
      case video if apiContent.isVideo => Video.make(content)
      case audio if apiContent.isAudio => Audio.make(content)
      case picture if apiContent.isImageContent => ImageContent.make(content)
      case _ => GenericContent(content)
    }
  }

  private def constructCommercial(tags: Tags, fields: Fields, apiContent: contentapi.Content) = {
    val section = Some(fields.section)

    model.Commercial(
      tags = tags,
      fields = fields,
      isInappropriateForSponsorship = apiContent.safeFields.get("isInappropriateForSponsorship").exists(_.toBoolean),
      sponsorshipTag = DfpAgent.sponsorshipTag(tags.tags, section),
      isFoundationSupported = DfpAgent.isFoundationSupported(tags.tags, section),
      isAdvertisementFeature = DfpAgent.isAdvertisementFeature(tags.tags, section),
      hasMultipleSponsors = DfpAgent.hasMultipleSponsors(tags.tags),
      hasMultipleFeatureAdvertisers = DfpAgent.hasMultipleFeatureAdvertisers(tags.tags),
      hasInlineMerchandise = DfpAgent.hasInlineMerchandise(tags.tags))
  }

  private def constructFields(apiContent: contentapi.Content) = {
    Fields (
      description = apiContent.safeFields.get("trailText"),
      trailText = apiContent.safeFields.get("trailText"), // alias for description
      id = apiContent.id,
      section = apiContent.sectionId.getOrElse(""),
      webTitle = apiContent.webTitle,
      url = SupportedUrl(apiContent),
      linkText = apiContent.webTitle,
      shortUrl = apiContent.safeFields("shortUrl"),
      standfirst = apiContent.safeFields.get("standfirst"),
      main = apiContent.safeFields.getOrElse("main",""),
      body = apiContent.safeFields.getOrElse("body",""),
      lastModified = apiContent.safeFields.get("lastModified").map(_.parseISODateTime).getOrElse(DateTime.now),
      displayHint = apiContent.safeFields.get("displayHint").getOrElse("")
    )
  }

  private def constructElements(apiContent: contentapi.Content) = {
    Elements(apiContent.elements
      .map(_.zipWithIndex.map { case (element, index) => Element(element, index) })
      .getOrElse(Nil))
  }

  private def constructMetaData(tags: Tags, fields: Fields, trail: Trail, apiContent: contentapi.Content) = {
    MetaData(
      tags = tags,
      fields = fields,
      membershipAccess = apiContent.safeFields.get("membershipAccess"),
      analyticsName = s"GFE:${fields.section}:${fields.id.substring(fields.id.lastIndexOf("/") + 1)}",
      adUnitSuffix = fields.section,
      cacheSeconds = {
        if (trail.isLive) 5
        else if (fields.lastModified > DateTime.now(fields.lastModified.getZone) - 1.hour) 10
        else if (fields.lastModified > DateTime.now(fields.lastModified.getZone) - 24.hours) 30
        else 300
      }

    )
  }

  private def constructTrail(
    tags: Tags,
    fields: Fields,
    commercial: Commercial,
    elements: Elements,
    apiContent: contentapi.Content) = {
    Trail(
      webPublicationDate = apiContent.webPublicationDateOption.getOrElse(DateTime.now),
      //webPublicationDate(edition: Edition): DateTime = webPublicationDate(edition.timezone),
      //webPublicationDate(zone: DateTimeZone): DateTime = webPublicationDate.withZone(zone),
      headline = apiContent.safeFields.getOrDefault("headline", ""),
      sectionName = apiContent.sectionName.getOrElse(""),
      thumbnailPath = apiContent.safeFields.get("thumbnail").map(ImgSrc(_, Naked)),
      isLive = apiContent.safeFields.get("liveBloggingNow").exists(_.toBoolean),
      isCommentable = apiContent.safeFields.get("commentable").exists(_.toBoolean),
      isClosedForComments = !apiContent.safeFields.get("commentCloseDate").exists(_.parseISODateTime.isAfterNow),
      leadingParagraphs = {
        val body = apiContent.safeFields.get("body")
        val souped = body flatMap { body =>
          val souped = Jsoup.parseBodyFragment(body).body().select("p")
          Option(souped) map { _.toList }
        }
        souped getOrElse Nil
      },
      byline = apiContent.safeFields.get("byline").map(stripHtml),
      trailPicture = elements.thumbnail.find(_.imageCrops.exists(_.width >= elements.trailPicMinDesiredSize))
        .orElse(elements.mainPicture)
        .orElse(elements.thumbnail),
      tags = tags,
      fields = fields,
      commercial = commercial,
      elements = elements
    )
  }

   private[model] def constructContent(apiContent: contentapi.Content) = {

    val fields = constructFields(apiContent)
    val elements = constructElements(apiContent)
    val tags = Tags(apiContent.tags map { Tag(_) })
    val commercial = constructCommercial(tags, fields, apiContent)
    val trail = constructTrail(tags, fields, commercial, elements, apiContent)
    val metadata = constructMetaData(tags, fields, trail, apiContent)
    val sharelinks = ShareLinks(tags, fields)

    val apifields = apiContent.safeFields
    val references: Map[String,String] = apiContent.references.map(ref => (ref.`type`, Reference(ref.id)._2)).toMap

    Content(
      elements = elements,
      tags = tags,
      fields = fields,
      metadata = metadata,
      trail = trail,
      commercial = commercial,
      sharelinks = sharelinks,
      publication = apifields.getOrElse("publication", ""),
      internalPageCode = apifields("internalPageCode"),
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
      cardStyle = CardStyle.apply(apiContent, TrailMetaData.empty),
      shouldHideAdverts = apifields.get("shouldHideAdverts").exists(_.toBoolean),
      witnessAssignment = references.get("witness-assignment"),
      isbn = references.get("isbn"),
      imdb = references.get("imdb"),
      javascriptReferences = apiContent.references.map(ref => Reference.toJavaScript(ref.id)),
      wordCount = {
        Jsoup.clean(fields.body, Whitelist.none()).split("\\s+").size
      },
      hasStoryPackage = apifields.get("hasStoryPackage").exists(_.toBoolean),
      resolvedMetaData = {
        val cardStyle = CardStyle(apiContent, TrailMetaData.empty)
        ResolvedMetaData.fromContentAndTrailMetaData(apiContent, TrailMetaData.empty, cardStyle)
      },
      rawOpenGraphImage = {
        val bestOpenGraphImage = if (FacebookShareUseTrailPicFirstSwitch.isSwitchedOn) {
          trail.trailPicture.flatMap(_.largestImageUrl)
        } else {
          None
        }
        bestOpenGraphImage
          .orElse(elements.mainPicture.flatMap(_.largestImageUrl))
          .orElse(trail.trailPicture.flatMap(_.largestImageUrl))
          .getOrElse(facebook.imageFallback)
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
      trailPicture = content.elements.thumbnail.find(_.imageCrops.exists(_.width >= 620))
          .orElse(content.elements.mainPicture).orElse(content.elements.videos.headOption)
    )
  }

  private def copyMetaData(content: Content) = {

    val contentType = if (content.tags.isLiveBlog) GuardianContentTypes.LiveBlog else GuardianContentTypes.Article

    content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:${content.fields.section}:${GuardianContentTypes.Article}:${content.fields.id.substring(content.fields.id.lastIndexOf("/") + 1)}",
      adUnitSuffix = content.fields.section + "/" + contentType.toLowerCase,
      isImmersive = content.fields.displayHint.contains("immersive"),
      schemaType = Some(ArticleSchemas(content.tags)),
      cacheSeconds = if (SoftPurgeWithLongCachingSwitch.isSwitchedOn) {
          if (content.trail.isLive) 5
          else if (content.fields.lastModified > DateTime.now(content.fields.lastModified.getZone) - 1.hour) 300
          else if (content.fields.lastModified > DateTime.now(content.fields.lastModified.getZone) - 24.hours) 1200
          else 1200
        } else {
          content.metadata.cacheSeconds
        }
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
    val metadata = copyMetaData(content)
    val sharelinks = copyShareLinks(content)
    val lightbox = GenericLightbox(elements, fields, trail,
      lightboxableCutoffWidth = 620,
      includeBodyImages = !tags.isLiveBlog)

    val bookReviewIsbn = content.isbn.map { i: String => Map("isbn" -> JsString(i)) }.getOrElse(Map())

    val javascriptConfig: Map[String, JsValue] = Map(
      ("contentType", JsString(metadata.contentType)),
      ("isLiveBlog", JsBoolean(tags.isLiveBlog)),
      ("inBodyInternalLinkCount", JsNumber(content.linkCounts.internal)),
      ("inBodyExternalLinkCount", JsNumber(content.linkCounts.external)),
      ("shouldHideAdverts", JsBoolean(content.shouldHideAdverts)),
      ("hasInlineMerchandise", JsBoolean(commercial.hasInlineMerchandise)),
      ("lightboxImages", lightbox.javascriptConfig),
      ("hasMultipleVideosInPage", JsBoolean(content.hasMultipleVideosInPage))
    ) ++ bookReviewIsbn

    val opengraphProperties: Map[String, String] = Map(
      ("og:type", "article"),
      ("article:published_time", trail.webPublicationDate.toString()),
      ("article:modified_time", content.fields.lastModified.toString()),
      ("article:tag", tags.keywords.map(_.name).mkString(",")),
      ("article:section", trail.sectionName),
      ("article:publisher", "https://www.facebook.com/theguardian"),
      ("article:author", tags.contributors.map(_.webUrl).mkString(","))
    )

    val twitterProperties: Map[String, String] = if (content.tags.isLiveBlog) {
      Map("twitter:card" -> "summary_large_image", "twitter:card" -> "summary")
    } else {
      Map("twitter:card" -> "summary_large_image")
    }

    val contentOverrides = content.copy(
      trail = trail,
      commercial = commercial,
      metadata = metadata,
      sharelinks = sharelinks,
      showFooterContainers = !tags.isLiveBlog && !content.shouldHideAdverts,
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties,
      twitterPropertiesOverrides = twitterProperties
    )

    Article(contentOverrides, lightbox)
  }
}

case class Article private (
  override val content: Content,
  lightbox: GenericLightbox) extends ContentType {

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
}

object Audio {
  def make(content: Content): Audio = {

    val contentType = GuardianContentTypes.Audio
    val fields = content.fields

    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:${fields.section}:$contentType:${fields.id.substring(fields.id.lastIndexOf("/") + 1)}",
      adUnitSuffix = content.fields.section + "/" + contentType.toLowerCase,
      schemaType = Some("https://schema.org/AudioObject")
    )

    val javascriptConfig: Map[String, JsValue] = Map(
      "contentType" -> JsString(contentType),
      "isPodcast" -> JsBoolean(content.tags.isPodcast))

    val contentOverrides = content.copy(
      metadata = metadata,
      javascriptConfigOverrides = javascriptConfig
    )

    Audio(contentOverrides)
  }
}

case class Audio private (override val content: Content) extends ContentType {

  lazy val downloadUrl: Option[String] = elements.mainAudio
    .flatMap(_.encodings.find(_.format == "audio/mpeg").map(_.url.replace("static.guim", "download.guardian")))

  private lazy val podcastTag: Option[Tag] = tags.tags.find(_.podcast.nonEmpty)
  lazy val iTunesSubscriptionUrl: Option[String] = podcastTag.flatMap(_.podcast.flatMap(_.subscriptionUrl))
  lazy val seriesFeedUrl: Option[String] = podcastTag.map(tag => s"/${tag.id}/podcast.xml")
}

object Video {
  def make(content: Content): Video = {

    val contentType = GuardianContentTypes.Video
    val fields = content.fields
    val elements = content.elements

    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:${fields.section}:$contentType:${fields.id.substring(fields.id.lastIndexOf("/") + 1)}",
      adUnitSuffix = content.fields.section + "/" + contentType.toLowerCase,
      schemaType = Some("https://schema.org/VideoObject")
    )
    val source: Option[String] = elements.videos.find(_.isMain).flatMap(_.source)

    val javascriptConfig: Map[String, JsValue] = Map(
      "contentType" -> JsString(contentType),
      "source" -> JsString(source.getOrElse("")),
      "embeddable" -> JsBoolean(elements.videos.find(_.isMain).map(_.embeddable).getOrElse(false)),
      "videoDuration" -> elements.videos.find(_.isMain).map{ v => JsNumber(v.duration)}.getOrElse(JsNull))


    val opengraphProperties = Map(
      "og:type" -> "video",
      "og:video:type" -> "text/html",
      "og:video" -> fields.webUrl,
      "video:tag" -> content.tags.keywords.map(_.name).mkString(",")
    )

    val contentOverrides = content.copy(
      metadata = metadata,
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties,
      twitterPropertiesOverrides = Map("twitter:card" -> "summary_large_image")
    )

    Video(contentOverrides, source)
  }
}

case class Video private (
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
    val lightbox = GalleryLightbox(content.elements, content.tags)
    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:${fields.section}:$contentType:${fields.id.substring(fields.id.lastIndexOf("/") + 1)}",
      adUnitSuffix = content.fields.section + "/" + contentType.toLowerCase,
      schemaType = Some("https://schema.org/ImageGallery"),
      openGraphImages = lightbox.openGraphImages
    )
    val sharelinks = content.sharelinks.copy(
      elementShareOrder = List("facebook", "twitter", "pinterestBlock"),
      pageShareOrder = List("facebook", "twitter", "email", "pinterestPage", "gplus", "whatsapp")
    )
    val trail = content.trail.copy(
      trailPicture = elements.thumbnail)

    val javascriptConfig: Map[String, JsValue] = Map(
      "contentType" -> JsString(contentType),
      "gallerySize" -> JsNumber(lightbox.size),
      "lightboxImages" -> lightbox.javascriptConfig
    )

    val openGraph: Map[String, String] = Map(
      "og:type" -> "article",
      "article:published_time" -> trail.webPublicationDate.toString,
      "article:modified_time" -> content.fields.lastModified.toString,
      "article:section" -> trail.sectionName,
      "article:tag" -> tags.keywords.map(_.name).mkString(","),
      "article:author" -> tags.contributors.map(_.webUrl).mkString(",")
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

    val contentOverrides = content.copy(
      metadata = metadata,
      trail = trail,
      sharelinks = sharelinks,
      javascriptConfigOverrides = javascriptConfig,
      twitterPropertiesOverrides = twitterProperties,
      opengraphPropertiesOverrides = openGraph,
      rawOpenGraphImage = {
        val bestOpenGraphImage = if (FacebookShareUseTrailPicFirstSwitch.isSwitchedOn) {
          trail.trailPicture.flatMap(_.largestImageUrl)
        } else {
          None
        }

        bestOpenGraphImage
          .orElse(lightbox.galleryImages.headOption.flatMap(_.largestImage.flatMap(_.url)))
          .getOrElse(conf.Configuration.facebook.imageFallback)
      }
    )

    Gallery(contentOverrides, lightbox)
  }
}

case class Gallery(
  override val content: Content,
  lightbox: GalleryLightbox) extends ContentType {

  def apply(index: Int): ImageAsset = lightbox.galleryImages(index).largestImage.get
}

case class GalleryLightbox(
  elements: Elements,
  tags: Tags
){
  def imageContainer(index: Int): ImageElement = galleryImages(index)

  val galleryImages: Seq[ImageElement] = elements.images.filter(_.isGallery)
  val largestCrops: Seq[ImageAsset] = galleryImages.flatMap(_.largestImage)
  val openGraphImages: Seq[String] = largestCrops.flatMap(_.url).map(ImgSrc(_, FacebookOpenGraphImage))
  val size = galleryImages.size
  val landscapes = largestCrops.filter(i => i.width > i.height).sortBy(_.index)
  val portraits = largestCrops.filter(i => i.width < i.height).sortBy(_.index)
  val isInPicturesSeries = tags.tags.exists(_.id == "lifeandstyle/series/in-pictures")

  val javascriptConfig: JsObject = {
    val imageJson = for {
      container <- galleryImages
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
      "images" -> JsArray(imageJson)
    ))
  }
}

case class GenericLightbox(
  elements: Elements,
  fields: Fields,
  trail: Trail,
  lightboxableCutoffWidth: Int,
  includeBodyImages: Boolean
) {
  lazy val mainFiltered = elements.mainPicture.filter(_.largestEditorialCrop.map(_.ratio).getOrElse(0) > 0.7).filter(_.largestEditorialCrop.map(_.width).getOrElse(1) > lightboxableCutoffWidth).toSeq
  lazy val bodyFiltered: Seq[ImageContainer] = elements.bodyImages.filter(_.largestEditorialCrop.map(_.width).getOrElse(1) > lightboxableCutoffWidth).toSeq

  val lightboxImages = if (includeBodyImages) mainFiltered ++ bodyFiltered else mainFiltered

  lazy val isMainMediaLightboxable = mainFiltered.nonEmpty

  lazy val javascriptConfig: JsObject = {
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
      "images" -> JsArray(imageJson)
    ))
  }
}

case class Interactive(override val content: Content) extends ContentType {

  lazy val fallbackEl = {
    val noscriptEls = Jsoup.parseBodyFragment(fields.body).getElementsByTag("noscript")

    if (noscriptEls.length > 0) {
      noscriptEls.html()
    } else {
      Jsoup.parseBodyFragment(fields.body).getElementsByTag("figure").html()
    }
  }

  lazy val figureEl = (Jsoup.parseBodyFragment(fields.body).getElementsByTag("figure").html("").outerHtml())
}

object Interactive {
  def apply(apiContent: contentapi.Content): Interactive = {
    val content = Content.constructContent(apiContent)
    val contentType = GuardianContentTypes.Interactive
    val fields = content.fields
    val elements = content.elements
    val tags = content.tags
    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:${fields.section}:$contentType:${fields.id.substring(fields.id.lastIndexOf("/") + 1)}",
      adUnitSuffix = fields.section + "/" + contentType.toLowerCase,
      isImmersive = fields.displayHint.contains("immersive")
    )

    val twitterProperties: Map[String, String] = Map(
      "twitter:title" -> fields.linkText,
      "twitter:card" -> "summary_large_image"
    )

    val contentOverrides = content.copy(
      metadata = metadata,
      javascriptConfigOverrides = Map("contentType" -> JsString(contentType)),
      twitterPropertiesOverrides = twitterProperties
    )
    Interactive(contentOverrides)
  }
}

object ImageContent {
  def make(content: Content): ImageContent = {
    val contentType = GuardianContentTypes.ImageContent
    val fields = content.fields
    val metadata = content.metadata.copy(
      contentType = contentType,
      analyticsName = s"GFE:${fields.section}:$contentType:${fields.id.substring(fields.id.lastIndexOf("/") + 1)}",
      adUnitSuffix = fields.section + "/" + contentType.toLowerCase,
      isImmersive = fields.displayHint.contains("immersive")
    )
    val lightbox = GenericLightbox(content.elements, content.fields, content.trail,
      lightboxableCutoffWidth = 940,
      includeBodyImages = false)
    val javascriptConfig: Map[String, JsValue] = Map(
      "contentType" -> JsString(contentType),
      "lightboxImages" -> lightbox.javascriptConfig
    )
    val contentOverrides = content.copy(
      metadata = metadata,
      javascriptConfigOverrides = javascriptConfig,
      twitterPropertiesOverrides = Map("twitter:card" -> "photo")
    )
    ImageContent(contentOverrides, lightbox)
  }
}

case class ImageContent(
  override val content: Content,
  lightBox: GenericLightbox ) extends ContentType

case class Tweet(id: String, images: Seq[String]) {
  val firstImage: Option[String] = images.headOption
}
