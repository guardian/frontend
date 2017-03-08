package model

import java.net.URL

import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.facia.api.{utils => fapiutils}
import com.gu.facia.client.models.TrailMetaData
import com.gu.targeting.client.Campaign
import common._
import conf.Configuration
import conf.switches.Switches._
import cricketPa.CricketTeams
import layout.ContentWidths.GalleryMedia
import model.content.{Atoms, MediaAssetPlatform, MediaAtom, Quiz}
import model.pressed._
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist
import org.scala_tools.time.Imports._
import play.api.libs.json._
import views.support._

import scala.collection.JavaConversions._
import scala.util.Try

sealed trait ContentType {
  def content: Content
  final def tags: Tags = content.tags
  final def elements: Elements = content.elements
  final def fields: Fields = content.fields
  final def atoms: Option[Atoms] = content.atoms
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
  atoms: Option[Atoms],
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
  paFootballTeams: Seq[String],
  javascriptReferences: Seq[JsObject],
  wordCount: Int,
  showByline: Boolean,
  hasStoryPackage: Boolean,
  rawOpenGraphImage: String
) {

  lazy val isBlog: Boolean = tags.blogs.nonEmpty
  lazy val isSeries: Boolean = tags.series.nonEmpty
  lazy val isFromTheObserver: Boolean = publication == "The Observer"
  lazy val primaryKeyWordTag: Option[Tag] = tags.tags.find(!_.isSectionTag)
  lazy val keywordTags: Seq[Tag] = tags.keywords.filter(tag => !tag.isSectionTag)
  lazy val shortUrlId = fields.shortUrlId
  lazy val shortUrlPath = shortUrlId
  lazy val discussionId = Some(shortUrlId)
  lazy val isImmersiveGallery = {
    metadata.contentType.toLowerCase == "gallery" && !metadata.commercial.exists(_.isPaidContent)
  }
  lazy val isExplore = ExploreTemplateSwitch.isSwitchedOn && tags.isExploreSeries
  lazy val isImmersive = fields.displayHint.contains("immersive") || isImmersiveGallery || tags.isTheMinuteArticle || isExplore
  lazy val isPaidContent: Boolean = tags.tags.exists{ tag => tag.id == "tone/advertisement-features" }
  lazy val campaigns: List[Campaign] = targeting.CampaignAgent.getCampaignsForTags(tags.tags.map(_.id))
  lazy val isRecipeArticle: Boolean = atoms.fold(false)(a => a.recipes.nonEmpty)

  lazy val hasSingleContributor: Boolean = {
    (tags.contributors.headOption, trail.byline) match {
      case (Some(t), Some(b)) => tags.contributors.length == 1 && t.name == b
      case _ => false
    }
  }

  lazy val hasTonalHeaderByline: Boolean = {
    (cardStyle == Comment || cardStyle == Editorial || (cardStyle == SpecialReport && tags.isComment)) &&
      hasSingleContributor &&
      metadata.contentType != GuardianContentTypes.ImageContent
  }

  lazy val hasBeenModified: Boolean =
    new Duration(fields.firstPublicationDate.getOrElse(trail.webPublicationDate), fields.lastModified).isLongerThan(Duration.standardSeconds(60))

  lazy val hasTonalHeaderIllustration: Boolean = tags.isLetters

  lazy val showCircularBylinePicAtSide: Boolean =
    cardStyle == Feature && tags.hasLargeContributorImage && tags.contributors.length == 1 && !tags.isInteractive

  lazy val signedArticleImage: String = {
    ImgSrc(rawOpenGraphImage, EmailImage)
  }

  // read this before modifying: https://developers.facebook.com/docs/opengraph/howtos/maximizing-distribution-media-content#images
  lazy val openGraphImage: String = {
    if (isPaidContent && FacebookShareImageLogoOverlay.isSwitchedOn) {
      ImgSrc(rawOpenGraphImage, Item700)
    } else {
      ImgSrc(rawOpenGraphImage, FacebookOpenGraphImage)
    }
  }

  // URL of image to use in the twitter card. Image must be less than 1MB in size: https://dev.twitter.com/cards/overview
  lazy val twitterCardImage: String = {
    if (isPaidContent && TwitterShareImageLogoOverlay.isSwitchedOn) {
      ImgSrc(rawOpenGraphImage, Item700)
    } else {
      ImgSrc(rawOpenGraphImage, TwitterImage)
    }
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

  lazy val showSectionNotTag: Boolean = {

    lazy val isChildrensBookBlog = tags.tags.exists { tag =>
      tag.id == "childrens-books-site/childrens-books-site" && tag.properties.tagType == "Blog"
    }

    lazy val isPaidContent = metadata.commercial.exists(_.isPaidContent)

    isChildrensBookBlog || isPaidContent
  }

  lazy val sectionLabelLink : String = {
    if (showSectionNotTag) {
      metadata.sectionId
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
    tags.tags.find( tag => tag.showSeriesInMeta && (tag.isBlog || tag.isSeries ))
  }

  lazy val seriesTag: Option[Tag] = {
    tags.blogs.find{tag => tag.id != "commentisfree/commentisfree"}.orElse(tags.series.headOption)
  }

  val seriesName: Option[String] = tags.series.filterNot(_.id == "commentisfree/commentisfree").headOption.map(_.name)

  lazy val linkCounts = LinkTo.countLinks(fields.body) + fields.standfirst.map(LinkTo.countLinks).getOrElse(LinkCounts.None)

  lazy val mainMediaVideo = Jsoup.parseBodyFragment(fields.main).body.getElementsByClass("element-video").headOption

  lazy val mainVideoCanonicalPath: Option[String] = mainMediaVideo.flatMap(video => {
    video.attr("data-canonical-url") match {
      case url if !url.isEmpty => Some(new URL(url).getPath.stripPrefix("/"))
      case _ => None
    }
  })

  lazy val hasMultipleVideosInPage: Boolean = mainMediaVideo match {
    case Some(_) => numberOfVideosInTheBody > 0
    case None => numberOfVideosInTheBody > 1
  }

  lazy val numberOfVideosInTheBody: Int = Jsoup.parseBodyFragment(fields.body).body().children().select("video[class=gu-video]").size()

  val legallySensitive: Boolean = fields.legallySensitive.getOrElse(false)

  def javascriptConfig: Map[String, JsValue] = Map(
    ("contentId", JsString(metadata.id)),
    ("publication", JsString(publication)),
    ("hasShowcaseMainElement", JsBoolean(elements.hasShowcaseMainElement)),
    ("hasStoryPackage", JsBoolean(hasStoryPackage)),
    ("pageCode", JsString(internalPageCode)),
    ("isContent", JsBoolean(true)),
    ("wordCount", JsNumber(wordCount)),
    ("references", JsArray(javascriptReferences)),
    ("showRelatedContent", JsBoolean(if (tags.isTheMinuteArticle) { false } else showInRelated && !legallySensitive)),
    ("productionOffice", JsString(productionOffice.getOrElse(""))),
    ("isImmersive", JsBoolean(isImmersive)),
    ("isExplore", JsBoolean(isExplore)),
    ("isPaidContent", JsBoolean(isPaidContent)),
    ("campaigns", JsArray(campaigns.map(Campaign.toJson)))
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

    val seriesMeta = tags.series.filterNot{ _.id == "commentisfree/commentisfree"} match {
      case Nil => Nil
      case allTags@(mainSeries :: _) => List(
        Some("series", JsString(mainSeries.name)),
        Some("seriesId", JsString(mainSeries.id)),
        Some("seriesTags", JsString(allTags.map(_.name).mkString(",")))
      )
    }

    // Tracking tags are used for things like commissioning desks.
    val trackingMeta = tags.tracking match {
      case Nil => None
      case trackingTags => Some("trackingNames", JsString(trackingTags.map(_.name).mkString(",")))
    }

    val articleMeta = if (tags.isTheMinuteArticle) {
      Some("isMinuteArticle", JsBoolean(tags.isTheMinuteArticle))
    } else None

    val atomsMeta = atoms.map { atoms =>
      val atomIdentifiers = atoms.all.map(atom => JsString(atom.id))
      ("atoms", JsArray(atomIdentifiers))
    }

    // There are many checks that might disable sticky top banner, listed below.
    // But if we are in the super sticky banner campaign, we must ignore them!
    val canDisableStickyTopBanner =
      metadata.shouldHideHeaderAndTopAds ||
      isPaidContent ||
      metadata.contentType == "Interactive" ||
      metadata.contentType == "Crossword"

    // These conditions must always disable sticky banner.
    val alwaysDisableStickyTopBanner =
      shouldHideAdverts ||
      metadata.sectionId == "childrens-books-site"

    val maybeDisableSticky = canDisableStickyTopBanner match {
      case true if !tags.hasSuperStickyBanner => Some("disableStickyTopBanner", JsBoolean(true))
      case _ if alwaysDisableStickyTopBanner  => Some("disableStickyTopBanner", JsBoolean(true))
      case _ => None
    }

    val meta: List[Option[(String, JsValue)]] = List(
      rugbyMeta,
      articleMeta,
      trackingMeta,
      atomsMeta,
      maybeDisableSticky
    ) ++ cricketMeta ++ seriesMeta
    meta.flatten.toMap
  }

  val opengraphProperties = Map(
    "og:title" -> metadata.webTitle,
    "og:description" -> fields.trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse(""),
    "og:image" -> openGraphImage
  )

  val twitterProperties = Map(
    "twitter:app:url:googleplay" -> metadata.webUrl.replaceFirst("^[a-zA-Z]*://", "guardian://"), //replace current scheme with guardian mobile app scheme
    "twitter:image" -> twitterCardImage,
    "twitter:card" -> "summary_large_image"
  ) ++ contributorTwitterHandle.map(handle => "twitter:creator" -> s"@$handle").toList

  val quizzes: Seq[Quiz] = atoms.map(_.quizzes).getOrElse(Nil)
  val media: Seq[MediaAtom] = atoms.map(_.media).getOrElse(Nil)
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
    val tags = Tags.make(apiContent)
    val commercial = Commercial.make(tags, apiContent)
    val trail = Trail.make(tags, fields, commercial, elements, metadata, apiContent)
    val sharelinks = ShareLinks(tags, fields, metadata)
    val atoms = Atoms.make(apiContent)
    val apifields = apiContent.fields
    val references: Map[String,String] = apiContent.references.map(ref => (ref.`type`, Reference.split(ref.id)._2)).toMap
    val cardStyle: fapiutils.CardStyle = fapiutils.CardStyle(apiContent, TrailMetaData.empty)


    Content(
      trail = trail,
      metadata = metadata,
      tags = tags,
      commercial = commercial,
      elements = elements,
      fields = fields,
      sharelinks = sharelinks,
      atoms = atoms,
      publication = apifields.flatMap(_.publication).getOrElse(""),
      internalPageCode = apifields.flatMap(_.internalPageCode).map(_.toString).getOrElse(""),
      contributorBio = apifields.flatMap(_.contributorBio),
      starRating = apifields.flatMap(_.starRating),
      allowUserGeneratedContent = apifields.flatMap(_.allowUgc).getOrElse(false),
      isExpired = apiContent.isExpired.getOrElse(false),
      productionOffice = apifields.flatMap(_.productionOffice.map(_.name)),
      tweets = apiContent.elements.getOrElse(Nil).filter(_.`type`.name == "Tweet").map{ tweet =>
        val images = tweet.assets.filter(_.`type`.name == "Image").flatMap(asset => asset.typeData.flatMap(_.secureFile).orElse(asset.file))
        Tweet(tweet.id, images)
      },
      showInRelated = apifields.flatMap(_.showInRelatedContent).getOrElse(false),
      cardStyle = CardStyle.make(cardStyle),
      shouldHideAdverts = apifields.flatMap(_.shouldHideAdverts).getOrElse(false),
      witnessAssignment = references.get("witness-assignment"),
      isbn = references.get("isbn"),
      imdb = references.get("imdb"),
      paFootballTeams = apiContent.references.filter(ref => ref.id.contains("pa-football-team")).map(ref => ref.id.split("/").last).distinct,
      javascriptReferences = apiContent.references.map(ref => Reference.toJavaScript(ref.id)),
      wordCount = Jsoup.clean(fields.body, Whitelist.none()).split("\\s+").length,
      hasStoryPackage = apifields.flatMap(_.hasStoryPackage).getOrElse(false),
      showByline = fapiutils.ResolvedMetaData.fromContentAndTrailMetaData(apiContent, TrailMetaData.empty, cardStyle).showByline,
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

object ArticleSchemas {
  val NewsArticle = "http://schema.org/NewsArticle"

  def apply(articleTags: Tags): String = {
    // http://schema.org/NewsArticle
    // http://schema.org/Review
    if (articleTags.isReview)
      "http://schema.org/Review"
    else if (articleTags.isLiveBlog)
      "http://schema.org/LiveBlogPosting"
    else
      NewsArticle
  }
}

object Article {

  private def copyCommercial(content: Content) = {
    content.commercial.copy(
      hasInlineMerchandise = content.isbn.isDefined || content.commercial.hasInlineMerchandise)
  }

  private def copyMetaData(content: Content, commercial: Commercial, lightbox: GenericLightbox, trail: Trail, tags: Tags) = {

    val contentType = if (content.tags.isLiveBlog) GuardianContentTypes.LiveBlog else GuardianContentTypes.Article
    val section = content.metadata.sectionId
    val id = content.metadata.id
    val fields = content.fields
    val bookReviewIsbn = content.isbn.map { i: String => Map("isbn" -> JsString(i)) }.getOrElse(Map())

    // we don't serve pre-roll if there are multiple videos in an article
    // `headOption` as the video could be main media or a regular embed, so just get the first video
    val videoDuration = content.elements.videos.headOption.map { v => JsNumber(v.videos.duration) }.getOrElse(JsNull)

    val javascriptConfig: Map[String, JsValue] = Map(
      ("isLiveBlog", JsBoolean(content.tags.isLiveBlog)),
      ("inBodyInternalLinkCount", JsNumber(content.linkCounts.internal)),
      ("inBodyExternalLinkCount", JsNumber(content.linkCounts.external)),
      ("shouldHideAdverts", JsBoolean(content.shouldHideAdverts)),
      ("hasInlineMerchandise", JsBoolean(commercial.hasInlineMerchandise)),
      ("lightboxImages", lightbox.javascriptConfig),
      ("hasMultipleVideosInPage", JsBoolean(content.hasMultipleVideosInPage)),
      ("isImmersive", JsBoolean(content.isImmersive)),
      ("isHosted", JsBoolean(false)),
      ("isSensitive", JsBoolean(fields.sensitive.getOrElse(false))),
      "videoDuration" -> videoDuration
    ) ++ bookReviewIsbn ++ AtomProperties(content.atoms)

    val opengraphProperties: Map[String, String] = Map(
      ("og:type", "article"),
      ("article:published_time", trail.webPublicationDate.toString()),
      ("article:modified_time", content.fields.lastModified.toString()),
      ("article:tag", tags.keywords.map(_.name).mkString(",")),
      ("article:section", trail.sectionName),
      ("article:publisher", "https://www.facebook.com/theguardian"),
      ("article:author", tags.contributors.map(_.metadata.webUrl).mkString(","))
    )

    content.metadata.copy(
      contentType = contentType,
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      schemaType = Some(ArticleSchemas(content.tags)),
      iosType = Some("Article"),
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties,
      shouldHideHeaderAndTopAds = (content.tags.isTheMinuteArticle || (content.isImmersive && (content.elements.hasMainMedia || content.fields.main.nonEmpty))) && content.tags.isArticle,
      contentWithSlimHeader = (content.isImmersive && content.tags.isArticle) || (content.isRecipeArticle && false)
    )
  }

  // Perform a copy of the content object to enable Article to override Content.
  def make(content: Content): Article = {

    val fields = content.fields
    val elements = content.elements
    val tags = content.tags
    val trail = content.trail
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
    val sharelinks = content.sharelinks

    val contentOverrides = content.copy(
      trail = trail,
      commercial = commercial,
      metadata = metadata,
      sharelinks = sharelinks
    )

    Article(contentOverrides, lightboxProperties)
  }
}

final case class Article (
  override val content: Content,
  lightboxProperties: GenericLightboxProperties) extends ContentType {

  val lightbox = GenericLightbox(content.elements, content.fields, content.trail, lightboxProperties)
  val isLiveBlog: Boolean = content.tags.isLiveBlog && content.fields.blocks.nonEmpty
  val isTheMinute: Boolean = content.tags.isTheMinuteArticle
  val isImmersive: Boolean = content.isImmersive
  val isExplore: Boolean = content.isExplore
  val isRecipeArticle: Boolean = content.isRecipeArticle
  lazy val hasVideoAtTop: Boolean = soupedBody.body().children().headOption
    .exists(e => e.hasClass("gu-video") && e.tagName() == "video")

  lazy val hasSupporting: Boolean = {
    val supportingClasses = Set("element--showcase", "element--supporting", "element--thumbnail")
    val leftColElements = soupedBody.body().select("body > *").find(_.classNames.intersect(supportingClasses).nonEmpty)
    leftColElements.isDefined
  }

  private lazy val soupedBody = Jsoup.parseBodyFragment(fields.body)
  lazy val hasKeyEvents: Boolean = soupedBody.body().select(".is-key-event").nonEmpty

  lazy val isSport: Boolean = tags.tags.exists(_.id == "sport/sport")
  lazy val blocks = content.fields.blocks
}

object Audio {
  def make(content: Content): Audio = {

    val contentType = GuardianContentTypes.Audio
    val fields = content.fields
    val id = content.metadata.id
    val section = content.metadata.sectionId
    val javascriptConfig: Map[String, JsValue] = Map(
      "isPodcast" -> JsBoolean(content.tags.isPodcast))

    val opengraphProperties = Map(
      // Not using the og:video properties here because we want end-users to visit the guardian website
      // when they click the thumbnail in the FB feed rather than playing the video "in-place"
      "og:type" -> "article",
      "article:published_time" -> content.trail.webPublicationDate.toString,
      "article:modified_time" -> content.fields.lastModified.toString,
      "article:section" -> content.trail.sectionName,
      "article:tag" -> content.tags.keywords.map(_.name).mkString(",")
    )

    val metadata = content.metadata.copy(
      contentType = contentType,
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      schemaType = Some("https://schema.org/AudioObject"),
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties
    )

    val contentOverrides = content.copy(
      metadata = metadata
    )

    Audio(contentOverrides)
  }
}

final case class Audio (override val content: Content) extends ContentType {

  lazy val downloadUrl: Option[String] = elements.mainAudio
    .flatMap(_.audio.encodings.find(_.format == "audio/mpeg").map(_.url))

  private lazy val podcastTag: Option[Tag] = tags.tags.find(_.properties.podcast.nonEmpty)
  lazy val iTunesSubscriptionUrl: Option[String] = podcastTag.flatMap(_.properties.podcast.flatMap(_.subscriptionUrl))
  lazy val seriesFeedUrl: Option[String] = podcastTag.map(tag => s"/${tag.id}/podcast.xml")

}

object AtomProperties {

  def hasYouTubeAtom(atoms: Option[Atoms]): Boolean = {
    val hasYouTubeAtom: Option[Boolean] = atoms.map(_.media.exists(_.assets.exists(_.platform == MediaAssetPlatform.Youtube)))
    hasYouTubeAtom.getOrElse(false)
  }

  def apply(atoms: Option[Atoms]): Map[String, JsBoolean] = {
    Map("hasYouTubeAtom" -> JsBoolean(hasYouTubeAtom(atoms)))
  }
}

object Video {
  def make(content: Content): Video = {

    val contentType = GuardianContentTypes.Video
    val fields = content.fields
    val elements = content.elements
    val section = content.metadata.sectionId
    val id = content.metadata.id
    val source: Option[String] = elements.videos.find(_.properties.isMain).flatMap(_.videos.source)

    val javascriptConfig: Map[String, JsValue] = Map(
      "isPodcast" -> JsBoolean(content.tags.isPodcast),
      "source" -> JsString(source.getOrElse("")),
      "embeddable" -> JsBoolean(elements.videos.find(_.properties.isMain).exists(_.videos.embeddable)),
      "videoDuration" -> elements.videos.find(_.properties.isMain).map{ v => JsNumber(v.videos.duration)}.getOrElse(JsNull)) ++ AtomProperties(content.atoms)


    val optionalOpengraphProperties = if(content.metadata.webUrl.startsWith("https://")) Map("og:video:secure_url" -> content.metadata.webUrl) else Nil
    val opengraphProperties = Map(
      // Not using the og:video properties here because we want end-users to visit the guardian website
      // when they click the thumbnail in the FB feed rather than playing the video "in-place"
      "og:type" -> "article",
      "article:published_time" -> content.trail.webPublicationDate.toString,
      "article:modified_time" -> content.fields.lastModified.toString,
      "article:section" -> content.trail.sectionName,
      "article:tag" -> content.tags.keywords.map(_.name).mkString(",")
    ) ++ optionalOpengraphProperties

    val metadata = content.metadata.copy(
      contentType = contentType,
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      schemaType = Some("http://schema.org/VideoObject"),
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties
    )

    val contentOverrides = content.copy(
      metadata = metadata
    )

    Video(contentOverrides, source, content.media.headOption)
  }
}

final case class Video (
  override val content: Content,
  source: Option[String],
  mediaAtom: Option[MediaAtom] ) extends ContentType {

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
    val section = content.metadata.sectionId
    val id = content.metadata.id
    val lightboxProperties = GalleryLightboxProperties(
      id = id,
      headline = content.trail.headline,
      shouldHideAdverts = content.shouldHideAdverts,
      standfirst = fields.standfirst)
    val lightbox = GalleryLightbox(elements, tags, lightboxProperties)
    val javascriptConfig: Map[String, JsValue] = Map(
      "gallerySize" -> JsNumber(lightbox.size),
      "lightboxImages" -> lightbox.javascriptConfig
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

    val metadata = content.metadata.copy(
      contentType = contentType,
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      schemaType = Some("https://schema.org/ImageGallery"),
      openGraphImages = lightbox.openGraphImages,
      javascriptConfigOverrides = javascriptConfig,
      twitterPropertiesOverrides = Map("twitter:title" -> fields.linkText),
      opengraphPropertiesOverrides = openGraph,
      contentWithSlimHeader = true
    )

    val contentOverrides = content.copy(
      metadata = metadata,
      trail = trail,
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
    .filter(_.images.largestEditorialCrop.map(_.ratioWholeNumber).getOrElse(0) > 0.7)
    .filter(_.images.largestEditorialCrop.map(_.width).getOrElse(1) > properties.lightboxableCutoffWidth).toSeq
  lazy val bodyFiltered: Seq[ImageElement] = elements.bodyImages.filter(_.images.largestEditorialCrop.map(_.width).getOrElse(1) > properties.lightboxableCutoffWidth)

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

    if (noscriptEls.nonEmpty) {
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
    val tags = content.tags
    val section = content.metadata.sectionId
    val id = content.metadata.id

    val metadata = content.metadata.copy(
      contentType = contentType,
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      twitterPropertiesOverrides = Map( "twitter:title" -> fields.linkText ),
      contentWithSlimHeader = true
    )
    val contentOverrides = content.copy(
      metadata = metadata
    )
    Interactive(
      contentOverrides,
      maybeBody = apiContent.fields.flatMap(_.body))
  }
}

object ImageContent {
  def make(content: Content): ImageContent = {
    val contentType = GuardianContentTypes.ImageContent
    val fields = content.fields
    val section = content.metadata.sectionId
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
      "lightboxImages" -> lightbox.javascriptConfig
    )
    val metadata = content.metadata.copy(
      contentType = contentType,
      adUnitSuffix = section + "/" + contentType.toLowerCase,
      javascriptConfigOverrides = javascriptConfig
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
      section = Some(SectionSummary.fromId("crosswords")),
      webTitle = crossword.name,
      contentType = contentType,
      iosType = None
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
