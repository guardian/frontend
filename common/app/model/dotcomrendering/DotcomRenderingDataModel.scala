package model.dotcomrendering

import com.gu.contentapi.client.model.v1.{Block => APIBlock, Blocks => APIBlocks}
import com.gu.contentapi.client.utils.AdvertisementFeature
import com.gu.contentapi.client.utils.format.ImmersiveDisplay
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import common.{Edition, Localisation, RichRequestHeader}
import conf.Configuration
import conf.switches.Switches
import experiments.ActiveExperiments
import model.dotcomrendering.pageElements.{PageElement, TextCleaner}
import model.{
  ArticleDateTimes,
  Badges,
  ContentFormat,
  ContentPage,
  ContentType,
  GUDateTimeFormatNew,
  InteractivePage,
  LiveBlogPage,
  PageWithStoryPackage,
}
import navigation._
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{AffiliateLinksCleaner, CamelCase, ContentLayout, JavaScriptPage}

// -----------------------------------------------------------------
// DCR DataModel
// -----------------------------------------------------------------

case class DotcomRenderingDataModel(
    version: Int,
    headline: String,
    standfirst: String,
    webTitle: String,
    mainMediaElements: List[PageElement],
    main: String,
    keyEvents: List[Block],
    blocks: List[Block],
    pagination: Option[Pagination],
    author: Author,
    webPublicationDate: String,
    webPublicationDateDisplay: String, // TODO remove
    webPublicationSecondaryDateDisplay: String,
    editionLongForm: String,
    editionId: String,
    pageId: String,
    // Format and previous flags
    format: ContentFormat,
    designType: String,
    tags: List[Tag],
    pillar: String,
    isImmersive: Boolean,
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
    beaconURL: String,
    isCommentable: Boolean,
    commercialProperties: Map[String, EditionCommercialProperties],
    pageType: PageType,
    starRating: Option[Int],
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
    isSpecialReport: Boolean, // Indicates whether the page is a special report.
)

object DotcomRenderingDataModel {

  implicit val pageElementWrites = PageElement.pageElementWrites

  implicit val writes = new Writes[DotcomRenderingDataModel] {
    def writes(model: DotcomRenderingDataModel) = {
      val obj = Json.obj(
        "version" -> model.version,
        "headline" -> model.headline,
        "standfirst" -> model.standfirst,
        "webTitle" -> model.webTitle,
        "mainMediaElements" -> model.mainMediaElements,
        "main" -> model.main,
        "keyEvents" -> model.keyEvents,
        "blocks" -> model.blocks,
        "pagination" -> model.pagination,
        "author" -> model.author,
        "webPublicationDate" -> model.webPublicationDate,
        "webPublicationDateDisplay" -> model.webPublicationDateDisplay,
        "webPublicationSecondaryDateDisplay" -> model.webPublicationSecondaryDateDisplay,
        "editionLongForm" -> model.editionLongForm,
        "editionId" -> model.editionId,
        "pageId" -> model.pageId,
        "format" -> model.format,
        "designType" -> model.designType,
        "tags" -> model.tags,
        "pillar" -> model.pillar,
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
        "beaconURL" -> model.beaconURL,
        "isCommentable" -> model.isCommentable,
        "commercialProperties" -> model.commercialProperties,
        "pageType" -> model.pageType,
        "starRating" -> model.starRating,
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
        "isSpecialReport" -> model.isSpecialReport,
      )

      ElementsEnhancer.enhanceDcrObject(obj)
    }
  }

  def toJson(model: DotcomRenderingDataModel): String = {
    def withoutNull(json: JsValue): JsValue =
      json match {
        case JsObject(fields) => JsObject(fields.filterNot { case (_, value) => value == JsNull })
        case other            => other
      }
    val jsValue = Json.toJson(model)
    Json.stringify(withoutNull(jsValue))
  }

  def forInteractive(
      page: InteractivePage,
      blocks: APIBlocks,
      request: RequestHeader,
      pageType: PageType,
  ): DotcomRenderingDataModel = {
    apply(
      page,
      request,
      None,
      linkedData = Nil, // TODO
      mainBlock = blocks.main,
      bodyBlocks = blocks.body.getOrElse(Nil),
      pageType,
      page.related.hasStoryPackage,
      keyEvents = Nil,
    )
  }

  def forArticle(
      page: PageWithStoryPackage, // for now, any non-liveblog page type
      blocks: APIBlocks,
      request: RequestHeader,
      pageType: PageType,
  ): DotcomRenderingDataModel = {
    val linkedData = LinkedData.forArticle(
      article = page.article,
      baseURL = Configuration.amp.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    apply(
      page = page,
      request = request,
      pagination = None,
      linkedData = linkedData,
      mainBlock = blocks.main,
      bodyBlocks = blocks.body.getOrElse(Nil),
      pageType = pageType,
      hasStoryPackage = page.related.hasStoryPackage,
      keyEvents = Nil,
    )
  }

  def forLiveblog(
      page: LiveBlogPage,
      blocks: APIBlocks,
      request: RequestHeader,
      pageType: PageType,
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

    val bodyBlocks = DotcomRenderingUtils.blocksForLiveblogPage(page, blocks)
    val keyEvents =
      blocks.requestedBodyBlocks
        .flatMap(blocks => blocks.get("body:key-events"))
        .getOrElse(Seq.empty[APIBlock])

    val linkedData = LinkedData.forLiveblog(
      liveblog = page,
      blocks = bodyBlocks,
      baseURL = Configuration.amp.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    apply(
      page,
      request,
      pagination,
      linkedData,
      blocks.main,
      bodyBlocks,
      pageType,
      page.related.hasStoryPackage,
      keyEvents,
    )
  }

  def apply(
      page: ContentPage,
      request: RequestHeader,
      pagination: Option[Pagination],
      linkedData: List[LinkedData],
      mainBlock: Option[APIBlock],
      bodyBlocks: Seq[APIBlock],
      pageType: PageType, // TODO remove as format is better
      hasStoryPackage: Boolean,
      keyEvents: Seq[APIBlock],
  ): DotcomRenderingDataModel = {

    val edition = Edition.edition(request)
    val content = page.item
    val isImmersive = content.metadata.format.exists(_.display == ImmersiveDisplay)
    val isPaidContent = content.metadata.designType.contains(AdvertisementFeature)

    val author: Author = Author(
      byline = content.trail.byline,
      twitterHandle = content.tags.contributors.headOption.flatMap(_.properties.twitterHandle),
    )

    val shouldAddAffiliateLinks = AffiliateLinksCleaner.shouldAddAffiliateLinks(
      switchedOn = Switches.AffiliateLinks.isSwitchedOn,
      section = content.metadata.sectionId,
      showAffiliateLinks = content.content.fields.showAffiliateLinks,
      supportedSections = Configuration.affiliateLinks.affiliateLinkSections,
      defaultOffTags = Configuration.affiliateLinks.defaultOffTags,
      alwaysOffTags = Configuration.affiliateLinks.alwaysOffTags,
      tagPaths = content.content.tags.tags.map(_.id),
      firstPublishedDate = content.content.fields.firstPublicationDate,
    )

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
      commercialBundleUrl = DotcomRenderingUtils.assetURL("javascripts/graun.commercial.dcr.js"),
      ampIframeUrl = DotcomRenderingUtils.assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val combinedConfig: JsObject = {
      val jsPageConfig: Map[String, JsValue] = JavaScriptPage.getMap(page, Edition(request), false, request)
      Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
    }

    val calloutsUrl: Option[String] = combinedConfig.fields.toList
      .filter(entry => entry._1 == "calloutsUrl")
      .headOption
      .flatMap(entry => entry._2.asOpt[String])

    val mainMediaElements =
      mainBlock
        .map(block => Block(block, page, shouldAddAffiliateLinks, request, true, calloutsUrl, contentDateTimes))
        .toList
        .flatMap(_.elements)

    val bodyBlocksDCR: List[model.dotcomrendering.Block] = bodyBlocks
      .filter(_.published || pageType.isPreview) // TODO lift?
      .map(block => Block(block, page, shouldAddAffiliateLinks, request, false, calloutsUrl, contentDateTimes))
      .toList

    val keyEventsDCR =
      keyEvents.map(block => Block(block, page, shouldAddAffiliateLinks, request, false, calloutsUrl, contentDateTimes))

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

    DotcomRenderingDataModel(
      author = author,
      badge = Badges.badgeFor(content).map(badge => DCRBadge(badge.seriesTag, badge.imageUrl)),
      beaconURL = Configuration.debug.beaconUrl,
      blocks = bodyBlocksDCR,
      commercialProperties = commercial.editionCommercialProperties,
      config = combinedConfig,
      contentType = content.metadata.contentType.map(_.name).getOrElse(""),
      contributionsServiceUrl = Configuration.contributionsService.url,
      designType = content.metadata.designType.map(_.toString).getOrElse("Article"),
      editionId = edition.id,
      editionLongForm = Edition(request).displayName,
      format = content.metadata.format.getOrElse(ContentFormat.defaultContentFormat),
      guardianBaseURL = Configuration.site.host,
      hasRelated = content.content.showInRelated,
      hasStoryPackage = hasStoryPackage,
      headline = content.trail.headline,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      isCommentable = content.trail.isCommentable,
      isImmersive = isImmersive,
      isSpecialReport = DotcomRenderingUtils.isSpecialReport(page),
      keyEvents = keyEventsDCR.toList,
      linkedData = linkedData,
      main = content.fields.main,
      mainMediaElements = mainMediaElements,
      matchUrl = DotcomRenderingUtils.makeMatchUrl(page),
      nav = Nav(page, edition),
      openGraphData = page.getOpenGraphProperties,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(Edition(request))),
      pageId = content.metadata.id,
      pageType = pageType, // TODO this info duplicates what is already elsewhere in format?
      pagination = pagination,
      pillar = DotcomRenderingUtils.findPillar(content.metadata.pillar, content.metadata.designType),
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
      tags = content.tags.tags.map(Tag.apply),
      trailText = TextCleaner.sanitiseLinks(edition)(content.trail.fields.trailText.getOrElse("")),
      twitterData = page.getTwitterProperties,
      version = 3,
      webPublicationDate = content.trail.webPublicationDate.toString,
      webPublicationDateDisplay =
        GUDateTimeFormatNew.formatDateTimeForDisplay(content.trail.webPublicationDate, request),
      webPublicationSecondaryDateDisplay = DotcomRenderingUtils.secondaryDateString(content, request),
      webTitle = content.metadata.webTitle,
      webURL = content.metadata.webUrl,
    )
  }
}
