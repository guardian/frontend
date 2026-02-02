package model

import java.net.URL
import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentapi.client.model.schemaorg.SchemaOrg
import com.gu.facia.api.{utils => fapiutils}
import com.gu.facia.client.models.TrailMetaData
import com.gu.targeting.client.Campaign
import common._
import conf.Configuration
import conf.switches.Switches._
import conf.cricketPa.CricketTeams
import layout.ContentWidths.GalleryMedia
import model.content.{Atoms, MediaAssetPlatform, MediaAtom, QuizAtom}
import model.pressed._
import org.jsoup.{Jsoup, nodes}
import org.jsoup.safety.Safelist
import com.github.nscala_time.time.Imports._
import play.api.libs.json._
import views.support._

import scala.jdk.CollectionConverters._
import scala.util.Try
import implicits.Booleans._
import model.liveblog.CalloutBlockElement
import org.joda.time.DateTime

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
    isHosted: Boolean,
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
    rawOpenGraphImage: Option[ImageAsset],
    schemaOrg: Option[SchemaOrg],
) {

  lazy val isBlog: Boolean = tags.blogs.nonEmpty
  lazy val isSeries: Boolean = tags.series.nonEmpty
  lazy val isFromTheObserver: Boolean = publication == "The Observer"
  lazy val primaryKeyWordTag: Option[Tag] = tags.tags.find(!_.isSectionTag)
  lazy val keywordTags: Seq[Tag] = tags.keywords.filter(tag => !tag.isSectionTag)
  lazy val shortUrlId = fields.shortUrlId
  lazy val shortUrlPath = shortUrlId
  lazy val discussionId = Some(shortUrlId)
  lazy val isGallery = metadata.contentType.contains(DotcomContentType.Gallery)
  lazy val isPhotoEssay = fields.displayHint.contains("photoEssay")
  lazy val isColumn = fields.displayHint.contains("column")
  lazy val isNumberedList = fields.displayHint.contains("numberedList")
  lazy val isSplash = fields.displayHint.contains("column") || fields.displayHint.contains("numberedList")
  lazy val isImmersive =
    fields.displayHint.contains("immersive") || isGallery || tags.isTheMinuteArticle || isPhotoEssay
  lazy val isPaidContent: Boolean = tags.tags.exists { tag => tag.id == "tone/advertisement-features" }
  lazy val isTheFilterUk: Boolean = tags.tags.exists { tag => tag.id == "thefilter/series/the-filter" }
  lazy val isTheFilterUs: Boolean = tags.tags.exists { tag => tag.id == "thefilter-us/series/thefilter-us" }
  lazy val isUSProductionOffice: Boolean = productionOffice.exists(_.toLowerCase == "us")

  // Some campaigns (Community callouts) are added to an article using a tag. Others (Reporter callouts) just use the
  // campaign ID from the targeting tool. We need to fetch boh here
  lazy val campaignIds = fields.blocks
    .map(_.body.flatMap(_.elements.flatMap {
      case CalloutBlockElement(campaignId, _) => Seq(campaignId)
      case _                                  => Seq()
    }))
    .getOrElse(Seq())
  lazy val idCampaigns: List[Campaign] =
    _root_.commercial.targeting.CampaignAgent.getCampaignsForIds(campaignIds)
  lazy val tagCampaigns: List[Campaign] =
    _root_.commercial.targeting.CampaignAgent.getCampaignsForTags(tags.tags.map(_.id))
  lazy val campaigns: List[Campaign] = idCampaigns ++ tagCampaigns.filter(c => !idCampaigns.exists(_.id == c.id))

  lazy val shouldAmplify: Boolean = {
    val shouldAmplifyContent = {
      if (tags.isLiveBlog) {
        AmpLiveBlogSwitch.isSwitchedOn
      } else if (tags.isInteractive) {
        AmpArticleSwitch.isSwitchedOn
      } else if (tags.isArticle) {
        val hasBodyBlocks: Boolean = fields.blocks.exists(b => b.body.nonEmpty)
        // Some Labs pages have quiz atoms but are not tagged as quizzes
        val hasQuizAtoms: Boolean = atoms.exists(a => a.quizzes.nonEmpty)

        AmpArticleSwitch.isSwitchedOn && hasBodyBlocks && !tags.isQuiz && !hasQuizAtoms && !isTheFilterUk
      } else {
        false
      }
    }

    val containsFormStacks: Boolean = fields.body.contains("guardiannewsandmedia.formstack.com")

    shouldAmplifyContent && !containsFormStacks
  }

  lazy val hasSingleContributor: Boolean = {
    (tags.contributors.headOption, trail.byline) match {
      case (Some(t), Some(b)) => tags.contributors.length == 1 && t.name == b
      case _                  => false
    }
  }

  lazy val hasTonalHeaderByline: Boolean = {
    (cardStyle == Comment || cardStyle == Editorial || (cardStyle == SpecialReport && tags.isComment)) &&
    hasSingleContributor &&
    !metadata.contentType.contains(DotcomContentType.ImageContent)
  }

  lazy val hasBeenModified: Boolean =
    new Duration(fields.firstPublicationDate.getOrElse(trail.webPublicationDate), fields.lastModified)
      .isLongerThan(Duration.standardSeconds(60))

  lazy val hasTonalHeaderIllustration: Boolean = tags.isLetters

  lazy val showCircularBylinePicAtSide: Boolean =
    !tags.isInteractive &&
      (cardStyle == Feature || tags.isReview && tags.hasLargeContributorImage && tags.contributors.length == 1)

  lazy val openGraphImageOrFallbackUrl: String =
    rawOpenGraphImage
      .flatMap(_.url)
      .getOrElse(Configuration.images.fallbackLogo)

  private val tagsWithoutAgeWarning = Seq(
    "tone/help",
    "info/info",
    "tone/recipes",
    "lifeandstyle/series/sudoku",
    "type/crossword",
    "lifeandstyle/series/kakuro",
    "the-scott-trust/the-scott-trust",
    "type/signup",
    "info/newsletter-sign-up",
    "guardian-live-events/guardian-live-events",
    "gnm-archive/gnm-archive",
  )
  def shareImageCategory: ShareImageCategory = {

    val isOldNews = !tags.tags.exists(tag => tagsWithoutAgeWarning.contains(tag.id)) &&
      trail.webPublicationDate.isBefore(DateTime.now().minusYears(1))

    val isOldOpinion = tags.tags.exists(_.id == "tone/comment") &&
      trail.webPublicationDate.isBefore(DateTime.now().minusYears(1))

    () match {
      case paid if isPaidContent                                   => Paid
      case filterUk if isTheFilterUk                               => FilterUk
      case filterUs if isTheFilterUs                               => FilterUs
      case oldcommentObserver if isOldOpinion && isFromTheObserver =>
        CommentObserverOldContent(trail.webPublicationDate.getYear)
      case oldComment if isOldOpinion => CommentGuardianOldContent(trail.webPublicationDate.getYear)
      case commentObserver if tags.isComment && isFromTheObserver => ObserverOpinion
      case comment if tags.isComment                              => GuardianOpinion
      case live if tags.isLiveBlog                                => Live
      case oldObserver if isOldNews && isFromTheObserver => ObserverOldContent(trail.webPublicationDate.getYear)
      case old if isOldNews                              => GuardianOldContent(trail.webPublicationDate.getYear)
      case ratingObserver if starRating.isDefined && isFromTheObserver => ObserverStarRating(starRating.get)
      case rating if starRating.isDefined                              => GuardianStarRating(starRating.get)
      case observerDefault if isFromTheObserver                        => ObserverDefault
      case default                                                     => GuardianDefault
    }
  }

  // read this before modifying: https://developers.facebook.com/docs/opengraph/howtos/maximizing-distribution-media-content#images
  lazy val openGraphImageProfile: ElementProfile = {
    val category = shareImageCategory
    OpenGraphImage.forCategory(
      category,
      shouldIncludeOverlay = FacebookShareImageLogoOverlay.isSwitchedOn,
      shouldUpscale = true,
    )
  }

  lazy val openGraphImage: String = ImgSrc(openGraphImageOrFallbackUrl, openGraphImageProfile)
  // These dimensions are just an educated guess (e.g. we don't take into account image-resizer being turned off)
  lazy val openGraphImageWidth: Option[Int] = openGraphImageProfile.width
  lazy val openGraphImageHeight: Option[Int] =
    for {
      img <- rawOpenGraphImage
      width <- openGraphImageWidth
    } yield Math
      .round(width / img.ratioDouble)
      .toInt // Assume image resizing maintains aspect ratio to calculate height

  // URL of image to use in the twitter card. Image must be less than 1MB in size: https://dev.twitter.com/cards/overview
  lazy val twitterCardImage = {
    val profile = OpenGraphImage.forCategory(shareImageCategory, TwitterShareImageLogoOverlay.isSwitchedOn)
    ImgSrc(openGraphImageOrFallbackUrl, profile)
  }

  lazy val syndicationType: String = {
    if (isBlog) {
      "blog"
    } else if (tags.isGallery) {
      "gallery"
    } else if (tags.isPodcast) {
      "podcast"
    } else if (tags.isAudio) {
      "audio"
    } else if (tags.isVideo) {
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

  lazy val sectionLabelLink: Option[String] = {
    if (showSectionNotTag) {
      Some(metadata.sectionId)
    } else
      tags.tags.find(_.isKeyword).map(_.id)
  }

  lazy val sectionLabelName: Option[String] = {
    if (this.showSectionNotTag) {
      Some(trail.sectionName)
    } else
      tags.tags.find(_.isKeyword).map(_.metadata.webTitle)
  }

  lazy val blogOrSeriesTag: Option[Tag] = tags.blogOrSeriesTag

  lazy val seriesTag: Option[Tag] = {
    tags.blogs.find { tag => tag.id != "commentisfree/commentisfree" }.orElse(tags.series.headOption)
  }

  val seriesName: Option[String] = tags.series.filterNot(_.id == "commentisfree/commentisfree").headOption.map(_.name)

  lazy val linkCounts: LinkCounts =
    LinkTo.countLinks(fields.body) + fields.standfirst.map(LinkTo.countLinks).getOrElse(LinkCounts.None)

  lazy val mainMediaVideo: Option[nodes.Element] =
    Jsoup.parseBodyFragment(fields.main).body.getElementsByClass("element-video").asScala.headOption

  lazy val mainVideoCanonicalPath: Option[String] = mainMediaVideo.flatMap(video => {
    video.attr("data-canonical-url") match {
      case url if !url.isEmpty => Some(new URL(url).getPath.stripPrefix("/"))
      case _                   => None
    }
  })

  lazy val hasMultipleVideosInPage: Boolean = mainMediaVideo match {
    case Some(_) => numberOfVideosInTheBody > 0
    case None    => numberOfVideosInTheBody > 1
  }

  lazy val numberOfVideosInTheBody: Int =
    Jsoup.parseBodyFragment(fields.body).body().children().select("video[class=gu-video]").size()

  val legallySensitive: Boolean = fields.legallySensitive.getOrElse(false)

  def javascriptConfig: Map[String, JsValue] =
    Map(
      ("contentId", JsString(metadata.id)),
      ("publication", JsString(publication)),
      ("hasShowcaseMainElement", JsBoolean(elements.hasShowcaseMainElement)),
      ("pageCode", JsString(internalPageCode)),
      ("isContent", JsBoolean(true)),
      ("wordCount", JsNumber(wordCount)),
      ("references", JsArray(javascriptReferences)),
      (
        "showRelatedContent",
        JsBoolean(if (tags.isTheMinuteArticle) {
          false
        } else showInRelated && !legallySensitive),
      ),
      ("productionOffice", JsString(productionOffice.getOrElse(""))),
      ("isImmersive", JsBoolean(isImmersive)),
      ("isColumn", JsBoolean(isColumn)),
      ("isNumberedList", JsBoolean(isNumberedList)),
      ("isSplash", JsBoolean(isSplash)),
      ("isPaidContent", JsBoolean(isPaidContent)),
      ("campaigns", JsArray(campaigns.map(Campaign.toJson))),
      ("contributorBio", JsString(contributorBio.getOrElse(""))),
    )

  def cricketTeam: Option[String] = {
    if (tags.isCricketLiveBlog && conf.switches.Switches.CricketScoresSwitch.isSwitchedOn) {
      CricketTeams.teamFor(this).map(_.wordsForUrl)
    } else None
  }

  def cricketMatchDate: Option[String] = {
    if (tags.isCricketLiveBlog && conf.switches.Switches.CricketScoresSwitch.isSwitchedOn) {
      Some(trail.webPublicationDate.withZone(DateTimeZone.UTC).toString("yyyy-MM-dd"))
    } else None
  }

  // Dynamic Meta Data may appear on the page for some content. This should be used for conditional metadata.
  def conditionalConfig: Map[String, JsValue] = {
    val rugbyMeta = if (tags.isRugbyMatch && conf.switches.Switches.RugbyScoresSwitch.isSwitchedOn) {
      val teamIds = tags.keywords.map(_.id).collect(RugbyContent.teamNameIds)
      val (team1, team2) = (teamIds.headOption.getOrElse(""), teamIds.lift(1).getOrElse(""))
      val date = RugbyContent.timeFormatter.format(Chronos.jodaDateTimeToJavaTimeDateTime(trail.webPublicationDate))
      Some(("rugbyMatch", JsString(s"/sport/rugby/api/score/$date/$team1/$team2")))
    } else None

    val cricketMeta = if (tags.isCricketLiveBlog && conf.switches.Switches.CricketScoresSwitch.isSwitchedOn) {
      List(
        cricketTeam.map(team => "cricketTeam" -> JsString(team)),
        cricketMatchDate.map(date => "cricketMatchDate" -> JsString(date)),
      )
    } else Nil

    val seriesMeta = tags.series.filterNot { _.id == "commentisfree/commentisfree" } match {
      case Nil                         => Nil
      case allTags @ (mainSeries :: _) =>
        List(
          Some("series", JsString(mainSeries.name)),
          Some("seriesId", JsString(mainSeries.id)),
          Some("seriesTags", JsString(allTags.map(_.name).mkString(","))),
        )
    }

    // Tracking tags are used for things like commissioning desks.
    val trackingMeta = tags.tracking match {
      case Nil          => None
      case trackingTags => Some("trackingNames", JsString(trackingTags.map(_.name).mkString(",")))
    }

    val articleMeta = if (tags.isTheMinuteArticle) {
      Some("isMinuteArticle", JsBoolean(tags.isTheMinuteArticle))
    } else None

    val atomsMeta = atoms.map { atoms =>
      val atomIdentifiers = atoms.all.map(atom => JsString(atom.id))
      ("atoms", JsArray(atomIdentifiers))
    }

    val atomTypesMeta = atoms.map { atoms =>
      ("atomTypes", JsObject(atoms.atomTypes.map { case (k, v) => k -> JsBoolean(v) }))
    }

    // There are many checks that might disable sticky top banner, listed below.
    // But if we are in the super sticky banner campaign, we must ignore them!
    val canDisableStickyTopBanner =
      metadata.shouldHideHeaderAndTopAds ||
        isPaidContent ||
        metadata.contentType.exists(c => c == DotcomContentType.Interactive || c == DotcomContentType.Crossword)

    // These conditions must always disable sticky banner.
    val alwaysDisableStickyTopBanner =
      shouldHideAdverts ||
        metadata.sectionId == "childrens-books-site"

    val maybeDisableSticky = canDisableStickyTopBanner match {
      case true                              => Some("disableStickyTopBanner", JsBoolean(true))
      case _ if alwaysDisableStickyTopBanner => Some("disableStickyTopBanner", JsBoolean(true))
      case _                                 => None
    }

    val meta: List[Option[(String, JsValue)]] = List(
      rugbyMeta,
      articleMeta,
      trackingMeta,
      atomsMeta,
      atomTypesMeta,
      maybeDisableSticky,
    ) ++ cricketMeta ++ seriesMeta
    meta.flatten.toMap
  }

  val opengraphProperties: Map[String, String] = Map(
    "og:title" -> StripHtmlTagsAndUnescapeEntities(metadata.webTitle),
    "og:description" -> fields.trailText.map(StripHtmlTagsAndUnescapeEntities(_)).getOrElse(""),
    "og:image" -> openGraphImage,
  ) ++ openGraphImageWidth.map("og:image:width" -> _.toString).toMap ++
    openGraphImageHeight.map("og:image:height" -> _.toString).toMap

  val twitterProperties: Map[String, String] = Map(
    "twitter:app:url:googleplay" -> metadata.webUrl
      .replaceFirst("^[a-zA-Z]*://", "guardian://"), // replace current scheme with guardian mobile app scheme
    "twitter:image" -> twitterCardImage,
    "twitter:card" -> "summary_large_image",
  ) ++ contributorTwitterHandle.map(handle => "twitter:creator" -> s"@$handle").toList

  val quizzes: Seq[QuizAtom] = atoms.map(_.quizzes).getOrElse(Nil)
  val media: Seq[MediaAtom] = atoms.map(_.media).getOrElse(Nil)

  lazy val submetaLinks: SubMetaLinks =
    SubMetaLinks.make(isImmersive, tags, blogOrSeriesTag, isFromTheObserver, sectionLabelLink, sectionLabelName)
}

object Content {

  def apply(apiContent: contentapi.Content): ContentType = {
    val content = make(apiContent)

    apiContent match {
      case _ if apiContent.isLiveBlog || apiContent.isArticle || apiContent.isSudoku => Article.make(content)
      case _ if apiContent.isGallery                                                 => Gallery.make(content)
      case _ if apiContent.isVideo                                                   => Video.make(content)
      case _ if apiContent.isAudio                                                   => Audio.make(content)
      case _ if apiContent.isImageContent                                            => ImageContent.make(content)
      case _                                                                         => GenericContent(content)
    }
  }

  def make(apiContent: contentapi.Content): Content = {
    val fields = Fields.make(apiContent)
    val metadata = MetaData.make(fields, apiContent)
    val elements = Elements.make(apiContent)
    val tags = Tags.make(apiContent)
    val commercial = model.Commercial.make(tags, apiContent)
    val trail = Trail.make(tags, fields, commercial, elements, metadata, apiContent)
    val sharelinks = ShareLinks(tags, fields, metadata)
    val atoms = Atoms.make(apiContent, sharelinks.pageShares)
    val apifields = apiContent.fields
    val references: Map[String, String] =
      apiContent.references.map(ref => (ref.`type`, Reference.split(ref.id)._2)).toMap
    val cardStyle: fapiutils.CardStyle = CardStylePicker(apiContent)
    val schemaOrg = apiContent.schemaOrg

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
      isHosted = apiContent.isHosted,
      productionOffice = apifields.flatMap(_.productionOffice.map(_.name)),
      tweets = apiContent.elements.getOrElse(Nil).filter(_.`type`.name == "Tweet").toSeq.map { tweet =>
        val images = tweet.assets
          .filter(_.`type`.name == "Image")
          .flatMap(asset => asset.typeData.flatMap(_.secureFile).orElse(asset.file))
          .toSeq
        Tweet(tweet.id, images)
      },
      showInRelated = apifields.flatMap(_.showInRelatedContent).getOrElse(false),
      cardStyle = CardStyle.make(cardStyle),
      shouldHideAdverts = apifields.flatMap(_.shouldHideAdverts).getOrElse(false),
      witnessAssignment = references.get("witness-assignment"),
      isbn = references.get("isbn"),
      imdb = references.get("imdb"),
      paFootballTeams = apiContent.references
        .filter(ref => ref.id.contains("pa-football-team"))
        .map(ref => ref.id.split("/").last)
        .toSeq
        .distinct,
      javascriptReferences = apiContent.references.toSeq.map(ref => Reference.toJavaScript(ref.id)),
      wordCount = Jsoup.clean(fields.body, Safelist.none()).split("\\s+").length,
      showByline =
        fapiutils.ResolvedMetaData.fromContentAndTrailMetaData(apiContent, TrailMetaData.empty, cardStyle).showByline,
      rawOpenGraphImage = FacebookShareUseTrailPicFirstSwitch.isSwitchedOn
        .toOption(trail.trailPicture.flatMap(_.largestImage))
        .flatten
        .orElse(elements.mainPicture.flatMap(_.images.largestImage))
        .orElse(trail.trailPicture.flatMap(_.largestImage)),
      schemaOrg = schemaOrg,
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

  private def copyMetaData(
      content: Content,
      commercial: Commercial,
      lightbox: GenericLightbox,
      trail: Trail,
      tags: Tags,
  ) = {

    val contentType: DotcomContentType =
      if (content.tags.isLiveBlog) DotcomContentType.LiveBlog else DotcomContentType.Article
    val section = content.metadata.sectionId
    val fields = content.fields
    val bookReviewIsbn = content.isbn.map { i: String => Map("isbn" -> JsString(i)) }.getOrElse(Map())

    // we don't serve pre-roll if there are multiple videos in an article
    // `headOption` as the video could be main media or a regular embed, so just get the first video
    val videoDuration =
      content.elements.videos.headOption.map { v => JsNumber(v.videos.duration) }.getOrElse(JsNumber(0))

    val javascriptConfig: Map[String, JsValue] = Map(
      ("isLiveBlog", JsBoolean(content.tags.isLiveBlog)),
      ("inBodyInternalLinkCount", JsNumber(content.linkCounts.internal)),
      ("inBodyExternalLinkCount", JsNumber(content.linkCounts.external)),
      ("shouldHideAdverts", JsBoolean(content.shouldHideAdverts)),
      ("lightboxImages", lightbox.javascriptConfig),
      ("hasMultipleVideosInPage", JsBoolean(content.hasMultipleVideosInPage)),
      ("isImmersive", JsBoolean(content.isImmersive)),
      ("isHosted", JsBoolean(content.isHosted)),
      ("isPhotoEssay", JsBoolean(content.isPhotoEssay)),
      ("isColumn", JsBoolean(content.isColumn)),
      ("isNumberedList", JsBoolean(content.isNumberedList)),
      ("isSplash", JsBoolean(content.isSplash)),
      ("isSensitive", JsBoolean(fields.sensitive.getOrElse(false))),
      "videoDuration" -> videoDuration,
    ) ++ bookReviewIsbn ++ AtomProperties(content.atoms)

    val author = if (tags.contributors.nonEmpty) {
      tags.contributors.map(_.metadata.webUrl).mkString(",")
    } else {
      content.trail.byline.getOrElse("Guardian Staff")
    }

    val opengraphProperties: Map[String, String] = Map(
      ("og:type", "article"),
      ("article:published_time", trail.webPublicationDate.toString()),
      ("article:modified_time", content.fields.lastModified.toString()),
      ("article:tag", tags.keywords.map(_.name).mkString(",")),
      ("article:section", trail.sectionName),
      ("article:publisher", "https://www.facebook.com/theguardian"),
      ("article:author", authorOrPA(author)),
    )

    content.metadata.copy(
      contentType = Some(contentType),
      adUnitSuffix = section + "/" + contentType.name.toLowerCase,
      schemaType = Some(ArticleSchemas(content.tags)),
      iosType = Some("Article"),
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties,
      shouldHideHeaderAndTopAds =
        (content.tags.isTheMinuteArticle || (content.isImmersive && (content.elements.hasMainMedia || content.fields.main.nonEmpty))) && content.tags.isArticle,
      contentWithSlimHeader = content.isImmersive && content.tags.isArticle,
    )
  }

  // Perform a copy of the content object to enable Article to override Content.
  def make(content: Content): Article = {

    val fields = content.fields
    val elements = content.elements
    val tags = content.tags
    val trail = content.trail
    val commercial = content.commercial
    val lightboxProperties = GenericLightboxProperties(
      lightboxableCutoffWidth = 620,
      includeBodyImages = !tags.isLiveBlog,
      id = content.metadata.id,
      headline = trail.headline,
      shouldHideAdverts = content.shouldHideAdverts,
      standfirst = fields.standfirst,
    )
    val lightbox = GenericLightbox(elements, fields, trail, lightboxProperties)
    val metadata = copyMetaData(content, commercial, lightbox, trail, tags)
    val sharelinks = content.sharelinks

    val contentOverrides = content.copy(
      trail = trail,
      commercial = commercial,
      metadata = metadata,
      sharelinks = sharelinks,
    )

    Article(contentOverrides, lightboxProperties)
  }

  private def authorOrPA: String => String = {
    case "Press Association" => "https://www.facebook.com/PAMediaGroupUK/"
    case otherwise           => otherwise
  }
}

final case class Article(override val content: Content, lightboxProperties: GenericLightboxProperties)
    extends ContentType {

  val lightbox = GenericLightbox(content.elements, content.fields, content.trail, lightboxProperties)
  val isLiveBlog: Boolean = content.tags.isLiveBlog && content.fields.blocks.nonEmpty
  val isTheMinute: Boolean = content.tags.isTheMinuteArticle
  val isImmersive: Boolean = content.isImmersive
  val isPhotoEssay: Boolean = content.isPhotoEssay
  val isColumn: Boolean = content.isColumn
  val isNumberedList: Boolean = content.isNumberedList
  val isSplash: Boolean = content.isSplash
  lazy val hasVideoAtTop: Boolean = soupedBody
    .body()
    .children()
    .asScala
    .headOption
    .exists(e => e.hasClass("gu-video") && e.tagName() == "video")

  lazy val hasSupporting: Boolean = {
    val supportingClasses = Set("element--showcase", "element--supporting", "element--thumbnail")
    val leftColElements =
      soupedBody.body().select("body > *").asScala.find(_.classNames.asScala.intersect(supportingClasses).nonEmpty)
    leftColElements.isDefined
  }

  private lazy val soupedBody = Jsoup.parseBodyFragment(fields.body)
  lazy val hasKeyEvents: Boolean = soupedBody.body().select(".is-key-event").asScala.nonEmpty

  lazy val isSport: Boolean = tags.tags.exists(_.id == "sport/sport")
  lazy val blocks = content.fields.blocks
}

object Audio {
  def make(content: Content): Audio = {

    val contentType = DotcomContentType.Audio
    val section = content.metadata.sectionId
    val javascriptConfig: Map[String, JsValue] = Map("isPodcast" -> JsBoolean(content.tags.isPodcast))

    val opengraphProperties = Map(
      // Not using the og:video properties here because we want end-users to visit the guardian website
      // when they click the thumbnail in the FB feed rather than playing the video "in-place"
      "og:type" -> "article",
      "article:published_time" -> content.trail.webPublicationDate.toString,
      "article:modified_time" -> content.fields.lastModified.toString,
      "article:section" -> content.trail.sectionName,
      "article:tag" -> content.tags.keywords.map(_.name).mkString(","),
    )

    val metadata = content.metadata.copy(
      contentType = Some(contentType),
      adUnitSuffix = section + "/" + contentType.name.toLowerCase,
      schemaType = Some("https://schema.org/AudioObject"),
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties,
    )

    val contentOverrides = content.copy(
      metadata = metadata,
    )

    Audio(contentOverrides)
  }
}

final case class Audio(override val content: Content) extends ContentType {

  lazy val downloadUrl: Option[String] = elements.mainAudio
    .flatMap(_.audio.encodings.find(_.format == "audio/mpeg").map(_.url))

  lazy val duration: Option[Int] = elements.mainAudio.map(_.audio.duration)

  private lazy val podcastTag: Option[Tag] = tags.tags.find(_.properties.podcast.nonEmpty)
  lazy val iTunesSubscriptionUrl: Option[String] = podcastTag.flatMap(_.properties.podcast.flatMap(_.subscriptionUrl))
  lazy val spotifyUrl: Option[String] = podcastTag.flatMap(_.properties.podcast.flatMap(_.spotifyUrl))
  lazy val seriesFeedUrl: Option[String] = podcastTag.map(tag => s"/${tag.id}/podcast.xml")
}

object AtomProperties {

  def hasYouTubeAtom(atoms: Option[Atoms]): Boolean = {
    val hasYouTubeAtom: Option[Boolean] =
      atoms.map(_.media.exists(_.assets.exists(_.platform == MediaAssetPlatform.Youtube)))
    hasYouTubeAtom.getOrElse(false)
  }

  def apply(atoms: Option[Atoms]): Map[String, JsBoolean] = {
    Map("hasYouTubeAtom" -> JsBoolean(hasYouTubeAtom(atoms)))
  }
}

object Video {
  def make(content: Content): Video = {

    val contentType = DotcomContentType.Video
    val elements = content.elements
    val section = content.metadata.sectionId
    val source = elements.videos
      .find(_.properties.isMain)
      .flatMap(_.videos.source)
      .orElse(content.media.headOption.flatMap(_.source))

    val javascriptConfig: Map[String, JsValue] = Map(
      "isPodcast" -> JsBoolean(content.tags.isPodcast),
      "source" -> JsString(source.getOrElse("")),
      "embeddable" -> JsBoolean(elements.videos.find(_.properties.isMain).exists(_.videos.embeddable)),
      "videoDuration" -> elements.videos
        .find(_.properties.isMain)
        .map { v => JsNumber(v.videos.duration) }
        .getOrElse(JsNumber(0)),
    ) ++ AtomProperties(content.atoms)

    val optionalOpengraphProperties =
      if (content.metadata.webUrl.startsWith("https://"))
        Map(
          "og:video:url" -> content.metadata.webUrl,
          "og:video:secure_url" -> content.metadata.webUrl,
        )
      else Map.empty
    val opengraphProperties = Map(
      // Not using the og:video properties here because we want end-users to visit the guardian website
      // when they click the thumbnail in the FB feed rather than playing the video "in-place"
      "og:type" -> "article",
      "article:published_time" -> content.trail.webPublicationDate.toString,
      "article:modified_time" -> content.fields.lastModified.toString,
      "article:section" -> content.trail.sectionName,
      "article:tag" -> content.tags.keywords.map(_.name).mkString(","),
    ) ++ optionalOpengraphProperties

    val metadata = content.metadata.copy(
      contentType = Some(contentType),
      adUnitSuffix = section + "/" + contentType.name.toLowerCase,
      schemaType = Some("http://schema.org/VideoObject"),
      javascriptConfigOverrides = javascriptConfig,
      opengraphPropertiesOverrides = opengraphProperties,
    )

    val contentOverrides = content.copy(
      metadata = metadata,
    )

    Video(contentOverrides, source, content.media.headOption)
  }
}

final case class Video(override val content: Content, source: Option[String], mediaAtom: Option[MediaAtom])
    extends ContentType {

  lazy val bylineWithSource: Option[String] = {
    val videoSource: Option[String] = source.orElse(mediaAtom.flatMap(_.source))

    def prettySource(source: String): String =
      source match {
        case "guardian.co.uk"        => "theguardian.com"
        case other if other.nonEmpty => s"Source: $other"
      }

    (trail.byline, videoSource) match {
      case (Some(b), Some(s)) if b.nonEmpty && s.nonEmpty => Some(s"$b, ${prettySource(s)}")
      case (Some(b), _) if b.nonEmpty                     => Some(b)
      case (_, Some(s)) if s.nonEmpty                     => Some(prettySource(s))
      case _                                              => None
    }
  }

  lazy val videoLinkText: String = {
    val suffixVariations = List(
      " - video",
      " – video",
      " - video interview",
      " – video interview",
      " - video interviews",
      " – video interviews",
    )
    suffixVariations.fold(trail.headline.trim) { (str, suffix) => str.stripSuffix(suffix) }
  }

  def sixteenByNineMetaImage: Option[String] =
    for {
      imageMedia <- mediaAtom.flatMap(_.posterImage) orElse content.elements.thumbnail.map(_.images)
      videoProfile <- Video1280.bestSrcFor(imageMedia)
    } yield videoProfile
}

object Gallery {
  def make(content: Content): Gallery = {

    val contentType = DotcomContentType.Gallery
    val fields = content.fields
    val elements = content.elements
    val tags = content.tags
    val section = content.metadata.sectionId
    val id = content.metadata.id
    val lightboxProperties = GalleryLightboxProperties(
      id = id,
      headline = content.trail.headline,
      shouldHideAdverts = content.shouldHideAdverts,
      standfirst = fields.standfirst,
    )
    val lightbox = GalleryLightbox(elements, tags, lightboxProperties)
    val javascriptConfig: Map[String, JsValue] = Map(
      "gallerySize" -> JsNumber(lightbox.size),
      "lightboxImages" -> lightbox.javascriptConfig,
    )
    val trail = content.trail.copy(trailPicture = elements.thumbnail.map(_.images))

    val openGraph: Map[String, String] = Map(
      "og:type" -> "article",
      "article:published_time" -> trail.webPublicationDate.toString,
      "article:modified_time" -> content.fields.lastModified.toString,
      "article:section" -> trail.sectionName,
      "article:tag" -> tags.keywords.map(_.name).mkString(","),
      "article:author" -> tags.contributors.map(_.metadata.webUrl).mkString(","),
    )

    val metadata = content.metadata.copy(
      contentType = Some(contentType),
      adUnitSuffix = section + "/" + contentType.name.toLowerCase,
      schemaType = Some("https://schema.org/ImageGallery"),
      openGraphImages = lightbox.openGraphImages,
      javascriptConfigOverrides = javascriptConfig,
      twitterPropertiesOverrides = Map("twitter:title" -> fields.linkText),
      opengraphPropertiesOverrides = openGraph,
      contentWithSlimHeader = true,
    )

    val contentOverrides = content.copy(
      metadata = metadata,
      trail = trail,
      rawOpenGraphImage = FacebookShareUseTrailPicFirstSwitch.isSwitchedOn
        .toOption(trail.trailPicture.flatMap(_.largestImage))
        .flatten
        .orElse(lightbox.galleryImages.headOption.flatMap(_.images.largestImage)),
    )

    Gallery(contentOverrides, lightboxProperties)
  }
}

final case class Gallery(override val content: Content, lightboxProperties: GalleryLightboxProperties)
    extends ContentType {

  val lightbox = GalleryLightbox(content.elements, content.tags, lightboxProperties)

  def apply(index: Int): ImageAsset = lightbox.galleryImages(index).images.largestImage.get
}

case class GalleryLightboxProperties(
    id: String,
    headline: String,
    shouldHideAdverts: Boolean,
    standfirst: Option[String],
)

case class GalleryLightbox(
    elements: Elements,
    tags: Tags,
    properties: GalleryLightboxProperties,
) {
  def imageContainer(index: Int): ImageElement = galleryImages(index)

  private val facebookImage: ElementProfile = {
    val category =
      if (tags.isComment) GuardianOpinion
      else if (tags.isLiveBlog) Live
      else GuardianDefault

    OpenGraphImage.forCategory(category, FacebookShareImageLogoOverlay.isSwitchedOn)
  }

  val galleryImages: Seq[ImageElement] = elements.images.filter(_.properties.isGallery)
  val largestCrops: Seq[ImageAsset] = galleryImages.flatMap(_.images.largestImage)
  val openGraphImages: Seq[String] = largestCrops.flatMap(_.url).map(ImgSrc(_, facebookImage))
  val size = galleryImages.size
  val landscapes = largestCrops.filter(i => i.width > i.height).sortBy(_.index)
  val portraits = largestCrops.filter(i => i.width < i.height).sortBy(_.index)
  val isInPicturesSeries = tags.tags.exists(_.id == "lifeandstyle/series/in-pictures")
  lazy val containsAffiliateableLinks: Boolean =
    largestCrops.flatMap(_.caption.map(AffiliateLinksCleaner.stringContainsAffiliateableLinks)).contains(true)

  val javascriptConfig: JsObject = {
    val imageJson = for {
      container <- galleryImages
      img <- container.images.largestEditorialCrop
    } yield {
      JsObject(
        Seq(
          "caption" -> JsString(img.caption.getOrElse("")),
          "credit" -> JsString(img.credit.getOrElse("")),
          "displayCredit" -> JsBoolean(img.displayCredit),
          "src" -> JsString(Item700.bestSrcFor(container.images).getOrElse("")),
          "srcsets" -> JsString(ImgSrc.srcset(container.images, GalleryMedia.lightbox)),
          "sizes" -> JsString(GalleryMedia.lightbox.sizes),
          "ratio" -> Try(JsNumber(img.width.toDouble / img.height.toDouble)).getOrElse(JsNumber(1)),
          "role" -> JsString(img.role.toString),
        ),
      )
    }
    JsObject(
      Seq(
        "id" -> JsString(properties.id),
        "headline" -> JsString(properties.headline),
        "shouldHideAdverts" -> JsBoolean(properties.shouldHideAdverts),
        "standfirst" -> JsString(properties.standfirst.getOrElse("")),
        "images" -> JsArray(imageJson),
      ),
    )
  }
}

case class GenericLightboxProperties(
    id: String,
    headline: String,
    shouldHideAdverts: Boolean,
    standfirst: Option[String],
    lightboxableCutoffWidth: Int,
    includeBodyImages: Boolean,
)

case class GenericLightbox(
    elements: Elements,
    fields: Fields,
    trail: Trail,
    properties: GenericLightboxProperties,
) {
  lazy val mainFiltered = elements.mainPicture
    .filter(_.images.largestEditorialCrop.map(_.width).getOrElse(1) > properties.lightboxableCutoffWidth)
    .toSeq
  lazy val bodyFiltered: Seq[ImageElement] = elements.bodyImages.filter(
    _.images.largestEditorialCrop.map(_.width).getOrElse(1) > properties.lightboxableCutoffWidth,
  )

  val lightboxImages = if (properties.includeBodyImages) mainFiltered ++ bodyFiltered else mainFiltered

  lazy val isMainMediaLightboxable = mainFiltered.nonEmpty

  lazy val javascriptConfig: JsObject = {
    val imageJson = for {
      container <- lightboxImages
      img <- container.images.largestEditorialCrop
    } yield {
      JsObject(
        Seq(
          "caption" -> JsString(img.caption.getOrElse("")),
          "credit" -> JsString(img.credit.getOrElse("")),
          "displayCredit" -> JsBoolean(img.displayCredit),
          "src" -> JsString(Item700.bestSrcFor(container.images).getOrElse("")),
          "srcsets" -> JsString(ImgSrc.srcset(container.images, GalleryMedia.lightbox)),
          "sizes" -> JsString(GalleryMedia.lightbox.sizes),
          "ratio" -> Try(JsNumber(img.width.toDouble / img.height.toDouble)).getOrElse(JsNumber(1)),
          "role" -> JsString(img.role.toString),
          "parentContentId" -> JsString(properties.id),
          "id" -> JsString(properties.id), // duplicated to simplify lightbox logic
        ),
      )
    }
    JsObject(
      Seq(
        "id" -> JsString(properties.id),
        "headline" -> JsString(properties.headline),
        "shouldHideAdverts" -> JsBoolean(properties.shouldHideAdverts),
        "standfirst" -> JsString(properties.standfirst.getOrElse("")),
        "images" -> JsArray(imageJson),
      ),
    )
  }
}

final case class Interactive(override val content: Content, maybeBody: Option[String]) extends ContentType {

  lazy val fallbackEl = {
    val noscriptEls = Jsoup.parseBodyFragment(fields.body).getElementsByTag("noscript")

    if (noscriptEls.asScala.nonEmpty) {
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
    val contentType = DotcomContentType.Interactive
    val fields = content.fields
    val section = content.metadata.sectionId

    val opengraphProperties: Map[String, String] = Map(
      ("og:type", "article"),
      ("article:published_time", content.trail.webPublicationDate.toString()),
      ("article:modified_time", content.fields.lastModified.toString()),
      ("article:tag", content.tags.keywords.map(_.name).mkString(",")),
      ("article:section", content.trail.sectionName),
      ("article:publisher", "https://www.facebook.com/theguardian"),
    )

    val metadata = content.metadata.copy(
      contentType = Some(contentType),
      adUnitSuffix = section + "/" + contentType.name.toLowerCase,
      twitterPropertiesOverrides = Map("twitter:title" -> fields.linkText),
      opengraphPropertiesOverrides = opengraphProperties,
    )
    val contentOverrides = content.copy(
      metadata = metadata,
    )
    Interactive(contentOverrides, maybeBody = apiContent.fields.flatMap(_.body))
  }
}

object ImageContent {
  def make(content: Content): ImageContent = {
    val contentType = DotcomContentType.ImageContent
    val fields = content.fields
    val section = content.metadata.sectionId
    val id = content.metadata.id
    val lightboxProperties = GenericLightboxProperties(
      lightboxableCutoffWidth = 940,
      includeBodyImages = false,
      id = id,
      headline = content.trail.headline,
      shouldHideAdverts = content.shouldHideAdverts,
      standfirst = fields.standfirst,
    )
    val lightbox = GenericLightbox(content.elements, content.fields, content.trail, lightboxProperties)
    val javascriptConfig: Map[String, JsValue] = Map(
      "lightboxImages" -> lightbox.javascriptConfig,
    )
    val metadata = content.metadata.copy(
      contentType = Some(contentType),
      adUnitSuffix = section + "/" + contentType.name.toLowerCase,
      javascriptConfigOverrides = javascriptConfig,
    )

    val contentOverrides = content.copy(
      metadata = metadata,
    )
    ImageContent(contentOverrides, lightboxProperties)
  }
}

final case class ImageContent(override val content: Content, lightboxProperties: GenericLightboxProperties)
    extends ContentType {

  val lightBox = GenericLightbox(content.elements, content.fields, content.trail, lightboxProperties)
}

object CrosswordContent {
  def make(crossword: CrosswordData, apicontent: contentapi.Content): CrosswordContent = {

    val content = Content(apicontent)
    val contentType = DotcomContentType.Crossword

    val metadata = content.metadata.copy(
      id = crossword.id,
      section = Some(SectionId.fromId("crosswords")),
      contentType = Some(contentType),
      iosType = None,
    )

    val contentOverrides = content.content.copy(metadata = metadata)

    CrosswordContent(contentOverrides, crossword)
  }
}

final case class CrosswordContent(override val content: Content, crossword: CrosswordData) extends ContentType

case class Tweet(id: String, images: Seq[String]) {
  val firstImage: Option[String] = images.headOption
}
