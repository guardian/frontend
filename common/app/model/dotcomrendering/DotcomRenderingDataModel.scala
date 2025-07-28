package model.dotcomrendering

import com.gu.contentapi.client.model.v1.{Block => APIBlock, Blocks => APIBlocks}
import com.gu.contentapi.client.utils.AdvertisementFeature
import com.gu.contentapi.client.utils.format.{ImmersiveDisplay, InteractiveDesign}
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import common.{CanonicalLink, Chronos, Edition, Localisation, RichRequestHeader}
import conf.Configuration
import crosswords.CrosswordPageWithContent
import experiments.ActiveExperiments
import model.dotcomrendering.DotcomRenderingUtils._
import model.dotcomrendering.pageElements.{AudioBlockElement, ImageBlockElement, PageElement, Role, TextCleaner}
import model.liveblog.BlockAttributes
import model.{
  ArticleDateTimes,
  Badges,
  CanonicalLiveBlog,
  ContentFormat,
  ContentPage,
  ContentType,
  CrosswordData,
  DotcomContentType,
  GUDateTimeFormatNew,
  Gallery,
  GalleryPage,
  ImageContentPage,
  ImageMedia,
  InteractivePage,
  LiveBlogPage,
  MediaPage,
  PageWithStoryPackage,
}
import navigation._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import services.NewsletterData
import views.support.{CamelCase, ContentLayout, JavaScriptPage}
// -----------------------------------------------------------------
// DCR DataModel
// -----------------------------------------------------------------

case class DotcomRenderingDataModel(
    version: Int,
    headline: String,
    standfirst: String,
    webTitle: String,
    affiliateLinksDisclaimer: Option[String],
    mainMediaElements: List[PageElement],
    main: String,
    filterKeyEvents: Boolean,
    pinnedPost: Option[Block],
    keyEvents: List[Block],
    mostRecentBlockId: Option[String],
    blocks: List[Block],
    pagination: Option[Pagination],
    author: Author,
    byline: Option[String],
    webPublicationDate: String,
    webPublicationDateDisplay: String, // TODO remove
    webPublicationSecondaryDateDisplay: String,
    editionLongForm: String,
    editionId: String,
    pageId: String,
    canonicalUrl: String,
    // Format and previous flags
    format: ContentFormat,
    designType: String,
    tags: List[Tag],
    pillar: String,
    isImmersive: Boolean,
    isLegacyInteractive: Boolean,
    sectionLabel: String,
    sectionUrl: String,
    sectionName: Option[String],
    subMetaSectionLinks: List[SubMetaLink],
    subMetaKeywordLinks: List[SubMetaLink],
    shouldHideAds: Boolean,
    isAdFreeUser: Boolean,
    webURL: String,
    linkedData: List[LinkedData],
    openGraphData: Map[String, String],
    twitterData: Map[String, String],
    config: JsObject,
    guardianBaseURL: String,
    contentType: String,
    hasRelated: Boolean,
    hasStoryPackage: Boolean,
    storyPackage: Option[OnwardCollectionResponse],
    beaconURL: String,
    isCommentable: Boolean,
    commercialProperties: Map[String, EditionCommercialProperties],
    pageType: PageType,
    starRating: Option[Int],
    audioArticleImage: Option[PageElement],
    trailPicture: Option[PageElement],
    trailText: String,
    nav: Nav,
    showBottomSocialButtons: Boolean,
    pageFooter: PageFooter,
    publication: String,
    shouldHideReaderRevenue: Boolean,
    slotMachineFlags: String, // slot machine (temporary for contributions development)
    contributionsServiceUrl: String,
    badge: Option[DCRBadge],
    matchUrl: Option[String], // Optional url used for match data
    matchType: Option[DotcomRenderingMatchType],
    isSpecialReport: Boolean, // Indicates whether the page is a special report.
    promotedNewsletter: Option[NewsletterData],
    showTableOfContents: Boolean,
    lang: Option[String],
    isRightToLeftLang: Boolean,
    crossword: Option[CrosswordData],
)

object DotcomRenderingDataModel {

  implicit val pageElementWrites: Writes[PageElement] = PageElement.pageElementWrites

  implicit val writes: Writes[DotcomRenderingDataModel] = new Writes[DotcomRenderingDataModel] {
    def writes(model: DotcomRenderingDataModel) = {
      val obj = Json.obj(
        "version" -> model.version,
        "headline" -> model.headline,
        "standfirst" -> model.standfirst,
        "webTitle" -> model.webTitle,
        "affiliateLinksDisclaimer" -> model.affiliateLinksDisclaimer,
        "mainMediaElements" -> model.mainMediaElements,
        "main" -> model.main,
        "filterKeyEvents" -> model.filterKeyEvents,
        "pinnedPost" -> model.pinnedPost,
        "keyEvents" -> model.keyEvents,
        "mostRecentBlockId" -> model.mostRecentBlockId,
        "blocks" -> model.blocks,
        "pagination" -> model.pagination,
        "author" -> model.author,
        "byline" -> model.byline,
        "webPublicationDate" -> model.webPublicationDate,
        "webPublicationDateDeprecated" -> model.webPublicationDate,
        "webPublicationDateDisplay" -> model.webPublicationDateDisplay,
        "webPublicationSecondaryDateDisplay" -> model.webPublicationSecondaryDateDisplay,
        "editionLongForm" -> model.editionLongForm,
        "editionId" -> model.editionId,
        "pageId" -> model.pageId,
        "canonicalUrl" -> model.canonicalUrl,
        "format" -> model.format,
        "designType" -> model.designType,
        "tags" -> model.tags,
        "pillar" -> model.pillar,
        "isLegacyInteractive" -> model.isLegacyInteractive,
        "isImmersive" -> model.isImmersive,
        "sectionLabel" -> model.sectionLabel,
        "sectionUrl" -> model.sectionUrl,
        "sectionName" -> model.sectionName,
        "subMetaSectionLinks" -> model.subMetaSectionLinks,
        "subMetaKeywordLinks" -> model.subMetaKeywordLinks,
        "shouldHideAds" -> model.shouldHideAds,
        "isAdFreeUser" -> model.isAdFreeUser,
        "webURL" -> model.webURL,
        "linkedData" -> model.linkedData,
        "openGraphData" -> model.openGraphData,
        "twitterData" -> model.twitterData,
        "config" -> model.config,
        "guardianBaseURL" -> model.guardianBaseURL,
        "contentType" -> model.contentType,
        "hasRelated" -> model.hasRelated,
        "hasStoryPackage" -> model.hasStoryPackage,
        "storyPackage" -> model.storyPackage,
        "beaconURL" -> model.beaconURL,
        "isCommentable" -> model.isCommentable,
        "commercialProperties" -> model.commercialProperties,
        "pageType" -> model.pageType,
        "starRating" -> model.starRating,
        "audioArticleImage" -> model.audioArticleImage,
        "trailPicture" -> model.trailPicture,
        "trailText" -> model.trailText,
        "nav" -> model.nav,
        "showBottomSocialButtons" -> model.showBottomSocialButtons,
        "pageFooter" -> model.pageFooter,
        "publication" -> model.publication,
        "shouldHideReaderRevenue" -> model.shouldHideReaderRevenue,
        "slotMachineFlags" -> model.slotMachineFlags,
        "contributionsServiceUrl" -> model.contributionsServiceUrl,
        "badge" -> model.badge,
        "matchUrl" -> model.matchUrl,
        "matchType" -> model.matchType,
        "isSpecialReport" -> model.isSpecialReport,
        "promotedNewsletter" -> model.promotedNewsletter,
        "showTableOfContents" -> model.showTableOfContents,
        "lang" -> model.lang,
        "isRightToLeftLang" -> model.isRightToLeftLang,
        "crossword" -> model.crossword,
      )

      ElementsEnhancer.enhanceDcrObject(obj)
    }
  }

  def toJson(model: DotcomRenderingDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    withoutNull(jsValue)
  }

  def forInteractive(
      page: InteractivePage,
      blocks: APIBlocks,
      request: RequestHeader,
      pageType: PageType,
  ): DotcomRenderingDataModel = {
    val baseUrl = if (request.isAmp) Configuration.amp.baseUrl else Configuration.dotcom.baseUrl

    apply(
      page = page,
      request = request,
      pagination = None,
      linkedData = LinkedData.forInteractive(
        interactive = page.item,
        baseURL = baseUrl,
        fallbackLogo = Configuration.images.fallbackLogo,
      ),
      mainBlock = blocks.main,
      bodyBlocks = blocks.body.getOrElse(Nil).toSeq,
      pageType = pageType,
      hasStoryPackage = page.related.hasStoryPackage,
      storyPackage = getStoryPackage(page.related.faciaItems, request),
      pinnedPost = None,
      keyEvents = Nil,
      newsletter = None,
    )
  }

  def forArticle(
      page: PageWithStoryPackage, // for now, any non-liveblog page type
      blocks: APIBlocks,
      request: RequestHeader,
      pageType: PageType,
      newsletter: Option[NewsletterData],
  ): DotcomRenderingDataModel = {
    val baseUrl = if (request.isAmp) Configuration.amp.baseUrl else Configuration.dotcom.baseUrl
    val linkedData =
      LinkedData.forArticle(
        article = page.article,
        baseURL = baseUrl,
        fallbackLogo = Configuration.images.fallbackLogo,
      )

    apply(
      page = page,
      request = request,
      pagination = None,
      linkedData = linkedData,
      mainBlock = blocks.main,
      bodyBlocks = blocks.body.getOrElse(Nil).toSeq,
      pageType = pageType,
      hasStoryPackage = page.related.hasStoryPackage,
      storyPackage = getStoryPackage(page.related.faciaItems, request),
      pinnedPost = None,
      keyEvents = Nil,
      newsletter = newsletter,
    )
  }

  def forMedia(
      mediaPage: MediaPage,
      request: RequestHeader,
      pageType: PageType,
      blocks: APIBlocks,
  ) = {

    val linkedData = LinkedData.forArticle(
      article = mediaPage.media,
      baseURL = Configuration.dotcom.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    apply(
      page = mediaPage,
      request = request,
      pageType = pageType,
      linkedData = linkedData,
      mainBlock = blocks.main,
      bodyBlocks = blocks.body.getOrElse(Nil).toSeq,
      hasStoryPackage = mediaPage.related.hasStoryPackage,
      storyPackage = getStoryPackage(mediaPage.related.faciaItems, request),
    )
  }

  def forImageContent(
      imageContentPage: ImageContentPage,
      request: RequestHeader,
      pageType: PageType,
      mainBlock: Option[APIBlock],
  ) = {

    val linkedData = LinkedData.forArticle(
      article = imageContentPage.image,
      baseURL = Configuration.dotcom.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    apply(
      page = imageContentPage,
      request = request,
      pageType = pageType,
      linkedData = linkedData,
      mainBlock = mainBlock,
      bodyBlocks = Seq.empty,
      hasStoryPackage = imageContentPage.related.hasStoryPackage,
      storyPackage = getStoryPackage(imageContentPage.related.faciaItems, request),
    )
  }

  def forGallery(
      galleryPage: GalleryPage,
      request: RequestHeader,
      pageType: PageType,
      blocks: APIBlocks,
  ) = {

    val linkedData = LinkedData.forArticle(
      article = galleryPage.gallery,
      baseURL = Configuration.dotcom.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    apply(
      page = galleryPage,
      request = request,
      pageType = pageType,
      linkedData = linkedData,
      mainBlock = blocks.main,
      bodyBlocks = blocks.body.getOrElse(Nil).toSeq,
      hasStoryPackage = galleryPage.related.hasStoryPackage,
      storyPackage = getStoryPackage(galleryPage.related.faciaItems, request),
    )
  }

  def forCrossword(
      crosswordPage: CrosswordPageWithContent,
      request: RequestHeader,
      pageType: PageType,
  ): DotcomRenderingDataModel = {
    val linkedData = LinkedData.forArticle(
      article = crosswordPage.item,
      baseURL = Configuration.dotcom.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    apply(
      page = crosswordPage,
      request = request,
      pageType = pageType,
      linkedData = linkedData,
      mainBlock = None,
      bodyBlocks = Seq.empty,
      crossword = Some(crosswordPage.crossword),
    )
  }

  def keyEventsFallback(
      blocks: APIBlocks,
  ): Seq[APIBlock] = {
    blocks.requestedBodyBlocks match {
      case Some(requestedBlocks) =>
        val keyEvent = requestedBlocks.getOrElse(CanonicalLiveBlog.timeline, Seq.empty[APIBlock])
        val summaryEvent = requestedBlocks.getOrElse(CanonicalLiveBlog.summary, Seq.empty[APIBlock])
        keyEvent.toSeq ++ summaryEvent.toSeq
      case None => Seq.empty[APIBlock]
    }
  }

  def forLiveblog(
      page: LiveBlogPage,
      blocks: APIBlocks,
      request: RequestHeader,
      pageType: PageType,
      filterKeyEvents: Boolean,
      forceLive: Boolean,
      newsletter: Option[NewsletterData],
  ): DotcomRenderingDataModel = {
    val pagination = page.currentPage.pagination.map(paginationInfo => {
      Pagination(
        currentPage = page.currentPage.currentPage.pageNumber,
        totalPages = paginationInfo.numberOfPages,
        newest = paginationInfo.newest.map(_.suffix),
        newer = paginationInfo.newer.map(_.suffix),
        oldest = paginationInfo.oldest.map(_.suffix),
        older = paginationInfo.older.map(_.suffix),
      )
    })

    val bodyBlocks = blocksForLiveblogPage(page, blocks, filterKeyEvents).map(ensureSummaryTitle)

    val allTimelineBlocks = blocks.body match {
      case Some(allBlocks) if allBlocks.nonEmpty =>
        allBlocks.filter(block => block.attributes.keyEvent.contains(true) || block.attributes.summary.contains(true))
      case _ => keyEventsFallback(blocks)
    }

    val timelineBlocks =
      orderBlocks(allTimelineBlocks.toSeq).map(ensureSummaryTitle)

    val baseUrl = if (request.isAmp) Configuration.amp.baseUrl else Configuration.dotcom.baseUrl
    val linkedData = LinkedData.forLiveblog(
      liveblog = page,
      blocks = bodyBlocks,
      baseURL = baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    val pinnedPost =
      blocks.requestedBodyBlocks
        .flatMap(_.get("body:pinned"))
        .getOrElse(blocks.body.fold(Seq.empty[APIBlock])(_.filter(_.attributes.pinned.contains(true)).toSeq))
        .headOption
        .map(ensureSummaryTitle)

    val mostRecentBlockId = getMostRecentBlockId(blocks)

    apply(
      page = page,
      request = request,
      pagination = pagination,
      linkedData = linkedData,
      mainBlock = blocks.main,
      bodyBlocks = bodyBlocks,
      pageType = pageType,
      hasStoryPackage = page.related.hasStoryPackage,
      storyPackage = getStoryPackage(page.related.faciaItems, request), // todo
      pinnedPost = pinnedPost,
      keyEvents = timelineBlocks,
      filterKeyEvents = filterKeyEvents,
      mostRecentBlockId = mostRecentBlockId,
      forceLive = forceLive,
      newsletter = newsletter,
    )
  }

  def apply(
      page: ContentPage,
      request: RequestHeader,
      pageType: PageType,
      linkedData: List[LinkedData],
      bodyBlocks: Seq[APIBlock],
      mainBlock: Option[APIBlock] = None,
      hasStoryPackage: Boolean = false,
      storyPackage: Option[OnwardCollectionResponse] = None,
      newsletter: Option[NewsletterData] = None,
      keyEvents: Seq[APIBlock] = Seq.empty,
      pagination: Option[Pagination] = None,
      pinnedPost: Option[APIBlock] = None,
      filterKeyEvents: Boolean = false,
      mostRecentBlockId: Option[String] = None,
      forceLive: Boolean = false,
      crossword: Option[CrosswordData] = None,
  ): DotcomRenderingDataModel = {

    val edition = Edition.edition(request)
    val content: ContentType = page.item
    val isImmersive = content.metadata.format.exists(_.display == ImmersiveDisplay)
    val isPaidContent = content.metadata.designType.contains(AdvertisementFeature)

    /** @deprecated – Use byline instead */
    val author: Author = Author(
      byline = content.trail.byline,
      twitterHandle = content.tags.contributors.headOption.flatMap(_.properties.twitterHandle),
    )

    def hasAffiliateLinks(
        content: ContentType,
        blocks: Seq[APIBlock],
    ): Boolean = {
      content match {
        case gallery: Gallery => gallery.lightbox.containsAffiliateableLinks
        // TODO: I think the below could be used for galleries too, because the bodyHtml includes all the caption texts as well
        case _ => blocks.exists(block => DotcomRenderingUtils.stringContainsAffiliateableLinks(block.bodyHtml))
      }
    }

    val shouldAddAffiliateLinks = DotcomRenderingUtils.shouldAddAffiliateLinks(content)
    val shouldAddDisclaimer = hasAffiliateLinks(content, bodyBlocks)

    val contentDateTimes: ArticleDateTimes = ArticleDateTimes(
      webPublicationDate = content.trail.webPublicationDate,
      firstPublicationDate = content.fields.firstPublicationDate,
      hasBeenModified = content.content.hasBeenModified,
      lastModificationDate = content.fields.lastModified,
    )

    val switches: Map[String, Boolean] = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })

    val config = Config(
      switches = switches,
      abTests = ActiveExperiments.getJsMap(request),
      ampIframeUrl = assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val combinedConfig: JsObject = {
      val jsPageConfig: Map[String, JsValue] =
        JavaScriptPage.getMap(page, Edition(request), pageType.isPreview, request)
      Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
    }

    val calloutsUrl: Option[String] = combinedConfig.fields.toList
      .find(_._1 == "calloutsUrl")
      .flatMap(entry => entry._2.asOpt[String])

    val dcrTags = content.tags.tags.map(Tag.apply)

    def getImageBlockElement(imageMedia: ImageMedia, role: Role) = {
      val imageData = imageMedia.allImages.headOption
        .map { d =>
          Map(
            "copyright" -> "",
            "alt" -> d.altText.getOrElse(""),
            "caption" -> d.caption.getOrElse(""),
            "credit" -> d.credit.getOrElse(""),
          )
        }
        .getOrElse(Map.empty)
      ImageBlockElement(
        imageMedia,
        imageData,
        Some(true),
        role,
        Seq.empty,
      )
    }

    val audioImageBlock: Option[ImageBlockElement] =
      if (page.metadata.contentType.contains(DotcomContentType.Audio)) {
        for {
          thumbnail <- page.item.elements.thumbnail
        } yield {
          getImageBlockElement(thumbnail.images, Role(Some("inline")))
        }
      } else {
        None
      }

    val trailPicture: Option[ImageBlockElement] =
      if (page.metadata.contentType.contains(DotcomContentType.Gallery)) {
        for {
          imageMedia <- page.item.trail.trailPicture
        } yield {
          // DCAR only relies on 'height', 'width', and 'isMaster' fields,
          // so we remove all other properties to reduce unnecessary data.
          val filteredImageMedia = ImageMedia(imageMedia.allImages.map { image =>
            image.copy(fields = image.fields.filter(f => {
              f._1 == "height" || f._1 == "width" || f._1 == "isMaster"
            }))
          })
          getImageBlockElement(filteredImageMedia, Role(Some("inline")))
        }
      } else {
        None
      }

    def toDCRBlock(isMainBlock: Boolean = false) = { block: APIBlock =>
      Block(
        block = block,
        page = page,
        shouldAddAffiliateLinks = shouldAddAffiliateLinks,
        request = request,
        isMainBlock = isMainBlock,
        calloutsUrl = calloutsUrl,
        dateTimes = contentDateTimes,
        tags = dcrTags,
      )
    }

    val mainMediaElements = {
      val pageElements = mainBlock
        .map(toDCRBlock(isMainBlock = true))
        .toList
        .flatMap(_.elements)

      page.metadata.contentType match {
        case Some(DotcomContentType.Audio) =>
          pageElements
            .map {
              case AudioBlockElement(assets, _) =>
                AudioBlockElement(assets, content.elements.mainAudio.map(_.properties.id))
              case pageElement => pageElement
            }
        case _ => pageElements
      }
    }

    val bodyBlocksDCR =
      bodyBlocks
        .filter(_.published || pageType.isPreview) // TODO lift?
        .map(toDCRBlock())
        .toList

    val keyEventsDCR = keyEvents.map(toDCRBlock())

    val pinnedPostDCR = pinnedPost.map(toDCRBlock())

    val commercial: Commercial = {
      val editionCommercialProperties = content.metadata.commercial
        .map { _.perEdition.mapKeys(_.id) }
        .getOrElse(Map.empty[String, EditionCommercialProperties])

      val prebidIndexSites = (for {
        commercial <- content.metadata.commercial
        sites <- commercial.prebidIndexSites
      } yield sites.toList).getOrElse(List())

      Commercial(
        editionCommercialProperties,
        prebidIndexSites,
        content.metadata.commercial,
        pageType,
      )
    }

    val modifiedFormat = getModifiedContent(content, forceLive)

    val isLegacyInteractive =
      modifiedFormat.design == InteractiveDesign && content.trail.webPublicationDate
        .isBefore(Chronos.javaTimeLocalDateTimeToJodaDateTime(InteractiveSwitchOver.date))

    val matchData = makeMatchData(page)

    def addAffiliateLinksDisclaimerDCR(shouldAddAffiliateLinks: Boolean, shouldAddDisclaimer: Boolean) = {
      if (shouldAddAffiliateLinks && shouldAddDisclaimer) {
        Some("true")
      } else {
        None
      }
    }

    DotcomRenderingDataModel(
      affiliateLinksDisclaimer = addAffiliateLinksDisclaimerDCR(shouldAddAffiliateLinks, shouldAddDisclaimer),
      audioArticleImage = audioImageBlock,
      trailPicture = trailPicture,
      author = author,
      badge = Badges.badgeFor(content).map(badge => DCRBadge(badge.seriesTag, badge.imageUrl)),
      beaconURL = Configuration.debug.beaconUrl,
      blocks = bodyBlocksDCR,
      byline = content.trail.byline,
      commercialProperties = commercial.editionCommercialProperties,
      config = combinedConfig,
      contentType = content.metadata.contentType.map(_.name).getOrElse(""),
      contributionsServiceUrl = Configuration.contributionsService.url,
      designType = content.metadata.designType.map(_.toString).getOrElse("Article"),
      editionId = edition.id,
      editionLongForm = Edition(request).displayName,
      format = modifiedFormat,
      guardianBaseURL = Configuration.site.host,
      hasRelated = content.content.showInRelated,
      hasStoryPackage = hasStoryPackage,
      storyPackage = storyPackage,
      headline = content.trail.headline,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      isCommentable = content.trail.isCommentable,
      isImmersive = isImmersive,
      isLegacyInteractive = isLegacyInteractive,
      isSpecialReport = isSpecialReport(page),
      filterKeyEvents = filterKeyEvents,
      pinnedPost = pinnedPostDCR,
      keyEvents = keyEventsDCR.toList,
      mostRecentBlockId = mostRecentBlockId,
      linkedData = linkedData,
      main = content.fields.main,
      mainMediaElements = mainMediaElements,
      matchUrl = matchData.map(_.matchUrl),
      matchType = matchData.map(_.matchType),
      nav = Nav(page, edition),
      openGraphData = page.getOpenGraphProperties,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(Edition(request))),
      pageId = content.metadata.id,
      canonicalUrl = CanonicalLink(request, content.metadata.webUrl),
      pageType = pageType, // TODO this info duplicates what is already elsewhere in format?
      pagination = pagination,
      pillar = findPillar(content.metadata.pillar, content.metadata.designType),
      publication = content.content.publication,
      sectionLabel = Localisation(content.content.sectionLabelName.getOrElse(""))(request),
      sectionName = content.metadata.section.map(_.value),
      sectionUrl = content.content.sectionLabelLink.getOrElse(""),
      shouldHideAds = content.content.shouldHideAdverts,
      shouldHideReaderRevenue = content.fields.shouldHideReaderRevenue.getOrElse(isPaidContent),
      showBottomSocialButtons = ContentLayout.showBottomSocialButtons(content),
      slotMachineFlags = request.slotMachineFlags,
      standfirst = TextCleaner.sanitiseLinks(edition)(content.fields.standfirst.getOrElse("")),
      starRating = content.content.starRating,
      subMetaKeywordLinks = content.content.submetaLinks.keywords.map(SubMetaLink.apply),
      subMetaSectionLinks =
        content.content.submetaLinks.sectionLabels.map(SubMetaLink.apply).filter(_.title.trim.nonEmpty),
      tags = dcrTags,
      trailText = TextCleaner.sanitiseLinks(edition)(content.trail.fields.trailText.getOrElse("")),
      twitterData = page.getTwitterProperties,
      version = 3,
      webPublicationDate = content.trail.webPublicationDate.toString,
      webPublicationDateDisplay =
        GUDateTimeFormatNew.formatDateTimeForDisplay(content.trail.webPublicationDate, request),
      webPublicationSecondaryDateDisplay = secondaryDateString(content, request),
      webTitle = content.metadata.webTitle,
      webURL = content.metadata.webUrl,
      promotedNewsletter = newsletter,
      showTableOfContents = content.fields.showTableOfContents.getOrElse(false),
      lang = content.fields.lang,
      isRightToLeftLang = content.fields.isRightToLeftLang,
      crossword = crossword,
    )
  }
}
