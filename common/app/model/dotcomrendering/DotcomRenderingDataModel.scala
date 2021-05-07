package model.dotcomrendering

import com.gu.contentapi.client.model.v1.{Block => APIBlock, Blocks => APIBlocks}
import com.gu.contentapi.client.utils.format.ImmersiveDisplay
import com.gu.contentapi.client.utils.{AdvertisementFeature, DesignType}
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import common.{Edition, Localisation, RichRequestHeader}
import conf.Configuration
import conf.switches.Switches
import experiments.ActiveExperiments
import model.dotcomrendering.pageElements.{PageElement, TextCleaner}
import model.{ArticleDateTimes, Badges, ContentFormat, ContentPage, ContentType, GUDateTimeFormatNew, InteractivePage, LiveBlogPage, PageWithStoryPackage, Pillar}
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

object ElementsEnhancer {

  // Note:
  //     In the file PageElement-Identifiers.md you will find a discussion of identifiers used by PageElements
  //     Also look for "03feb394-a17d-4430-8384-edd1891e0d01"

  def enhanceElement(element: JsValue): JsValue = {
    element.as[JsObject] ++ Json.obj("elementId" -> java.util.UUID.randomUUID.toString)
  }

  def enhanceElements(elements: JsValue): IndexedSeq[JsValue] = {
    elements.as[JsArray].value.map(element => enhanceElement(element))
  }

  def enhanceObjectWithElementsAtDepth1(obj: JsValue): JsValue = {
    val elements = obj.as[JsObject].value("elements")
    obj.as[JsObject] ++ Json.obj("elements" -> enhanceElements(elements))
  }

  def enhanceObjectsWithElementsAtDepth1(objs: JsValue): IndexedSeq[JsValue] = {
    objs.as[JsArray].value.map(obj => enhanceObjectWithElementsAtDepth1(obj))
  }

  def enhanceDcrObject(obj: JsObject): JsObject = {
    obj ++
      Json.obj("blocks" -> enhanceObjectsWithElementsAtDepth1(obj.value("blocks"))) ++
      Json.obj("mainMediaElements" -> enhanceElements(obj.value("mainMediaElements"))) ++
      Json.obj("keyEvents" -> enhanceObjectsWithElementsAtDepth1(obj.value("keyEvents")))
  }
}

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
    request: RequestHeader,
  ): DotcomRenderingDataModel = ???

  def forArticle(
    page: PageWithStoryPackage,
    blocks: APIBlocks,
    request: RequestHeader,
  ): DotcomRenderingDataModel = ???

  def apply(
    page: ContentPage,
    request: RequestHeader,
    edition: Edition,
    pagination: Option[Pagination],
    linkedData: List[LinkedData],
    blocks: APIBlocks,
    pageType: PageType, // TODO remove as format is better
    hasStoryPackage: Boolean,
  ): DotcomRenderingDataModel = {

    def findPillar(pillar: Option[Pillar], designType: Option[DesignType]): String = {
      pillar
        .map { pillar =>
          if (designType == AdvertisementFeature) "labs"
          else if (pillar.toString.toLowerCase == "arts") "culture"
          else pillar.toString.toLowerCase()
        }
        .getOrElse("news")
    }

    def nav(page: ContentPage, edition: Edition): Nav = {
      val navMenu = NavMenu(page, edition)
      Nav(
        currentUrl = navMenu.currentUrl,
        pillars = navMenu.pillars,
        otherLinks = navMenu.otherLinks,
        brandExtensions = navMenu.brandExtensions,
        currentNavLinkTitle = navMenu.currentNavLink.map(NavLink.id),
        currentPillarTitle = navMenu.currentPillar.map(NavLink.id),
        subNavSections = navMenu.subNavSections,
        readerRevenueLinks = ReaderRevenueLinks.all,
      )
    }

    def secondaryDateString(content: ContentType, request: RequestHeader): String = {
      def format(dt: DateTime, req: RequestHeader): String = GUDateTimeFormatNew.formatDateTimeForDisplay(dt, req)

      val firstPublicationDate = content.fields.firstPublicationDate
      val webPublicationDate = content.trail.webPublicationDate
      val isModified = content.content.hasBeenModified && (!firstPublicationDate.contains(webPublicationDate))

      if (isModified) {
        "First published on " + format(firstPublicationDate.getOrElse(webPublicationDate), request)
      } else {
        "Last modified on " + format(content.fields.lastModified, request)
      }
    }

    val content = page.item
    val isImmersive = content.metadata.format.exists(_.display == ImmersiveDisplay)
    val isPaidContent: Boolean = content.metadata.designType.contains(AdvertisementFeature)

    val author: Author = Author(
      byline = content.trail.byline,
      twitterHandle = content.tags.contributors.headOption.flatMap(_.properties.twitterHandle),
    )

    val shouldAddAffiliateLinks: Boolean = AffiliateLinksCleaner.shouldAddAffiliateLinks(
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
      commercialBundleUrl = DotcomRenderingUtils.buildFullCommercialUrl("javascripts/graun.commercial.dcr.js"),
      ampIframeUrl = DotcomRenderingUtils.buildFullCommercialUrl("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val jsPageConfig: Map[String, JsValue] = JavaScriptPage.getMap(page, Edition(request), false, request)

    val combinedConfig: JsObject = Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))

    val calloutsUrl: Option[String] = combinedConfig.fields.toList
      .filter(entry => entry._1 == "calloutsUrl")
      .headOption
      .flatMap(entry => entry._2.asOpt[String])

    val mainBlock = {
      blocks.main.map(block =>
        Block(block, page, shouldAddAffiliateLinks, request, true, calloutsUrl, contentDateTimes),
      )
    }

    // TODO lift
    val bodyBlocksRaw: Seq[com.gu.contentapi.client.model.v1.Block] = page match {
      case lb: LiveBlogPage => DotcomRenderingUtils.blocksForLiveblogPage(lb, blocks)
      case _          => blocks.body.getOrElse(Nil)
    }

    val bodyBlocks: List[model.dotcomrendering.Block] = bodyBlocksRaw
      .filter(_.published || pageType.isPreview) // TODO lift
      .map(block => Block(block, page, shouldAddAffiliateLinks, request, false, calloutsUrl, contentDateTimes))
      .toList

    val keyEvents: Seq[model.dotcomrendering.Block] = {
      blocks.requestedBodyBlocks
        .getOrElse(Map.empty[String, Seq[APIBlock]])
        .getOrElse("body:key-events", Seq.empty[APIBlock])
        .map(block => Block(block, page, shouldAddAffiliateLinks, request, false, calloutsUrl, contentDateTimes))
    }

    val commercial: Commercial = Commercial(
      editionCommercialProperties = content.metadata.commercial
        .map { _.perEdition.mapKeys(_.id) }
        .getOrElse(Map.empty[String, EditionCommercialProperties]),

      prebidIndexSites = (for {
        commercial <- content.metadata.commercial
        sites <- commercial.prebidIndexSites
      } yield sites.toList).getOrElse(List()),

      content.metadata.commercial,
      pageType,
    )

    val pageFooter: PageFooter = PageFooter(
      FooterLinks.getFooterByEdition(Edition(request)),
    )

    val badge: Option[DCRBadge] = Badges
      .badgeFor(content)
      .map(badge =>
        DCRBadge(
          badge.seriesTag,
          badge.imageUrl,
        ),
      )

    DotcomRenderingDataModel(
      author = author,
      badge = badge,
      beaconURL = Configuration.debug.beaconUrl,
      blocks = bodyBlocks,
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
      keyEvents = keyEvents.toList,
      linkedData = linkedData,
      main = content.fields.main,
      mainMediaElements = mainBlock.toList.flatMap(_.elements),
      matchUrl = DotcomRenderingUtils.makeMatchUrl(page),
      nav = nav(page, edition),
      openGraphData = page.getOpenGraphProperties,
      pageFooter = pageFooter,
      pageId = content.metadata.id,
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
      subMetaSectionLinks = content.content.submetaLinks.sectionLabels.map(SubMetaLink.apply).filter(_.title.trim.nonEmpty),
      tags = content.tags.tags.map(Tag.apply),
      trailText = TextCleaner.sanitiseLinks(edition)(content.trail.fields.trailText.getOrElse("")),
      twitterData = page.getTwitterProperties,
      version = 3,
      webPublicationDate = content.trail.webPublicationDate.toString,
      webPublicationDateDisplay = GUDateTimeFormatNew.formatDateTimeForDisplay(content.trail.webPublicationDate, request),
      webPublicationSecondaryDateDisplay = secondaryDateString(content, request),
      webTitle = content.metadata.webTitle,
      webURL = content.metadata.webUrl,
    )
  }
}
