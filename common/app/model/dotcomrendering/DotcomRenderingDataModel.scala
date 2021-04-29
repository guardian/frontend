package model.dotcomrendering

import com.gu.contentapi.client.model.v1.{Blocks => APIBlocks}
import com.gu.contentapi.client.utils.{AdvertisementFeature, DesignType}
import com.gu.contentapi.client.utils.format.ImmersiveDisplay
import common.{Edition, Localisation}
import common.commercial.EditionCommercialProperties
import conf.Configuration
import model.dotcomrendering.pageElements.{PageElement, TextCleaner}
import model.{ContentFormat, ContentPage, ContentType, GUDateTimeFormatNew, InteractivePage, PageWithStoryPackage, Pillar}
import navigation.{Nav, NavLink, NavMenu, ReaderRevenueLinks}
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{ImgSrc, Item300}


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
    request: RequestHeader,
    blocks: APIBlocks,
    pageType: PageType,
  ): DotcomRenderingDataModel = ???

  def foo(
    page: ContentPage,
    request: RequestHeader,
    edition: Edition,
    pagination: Option[Pagination],
    linkedData: List[LinkedData],
  ): DotcomRenderingDataModel = {

    def toDCRTag(t: model.Tag): Tag = {
      Tag(
        t.id,
        t.properties.tagType,
        t.properties.webTitle,
        t.properties.twitterHandle,
        t.properties.contributorLargeImagePath.map(src => ImgSrc(src, Item300)),
      )
    }

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
      val isModified = content.content.hasBeenModified && (!firstPublicationDate.contains(webPublicationDate)

      if (isModified) {
        "First published on " + format(firstPublicationDate.getOrElse(webPublicationDate), request)
      } else {
        "Last modified on " + format(content.fields.lastModified, request)
      }
    }

    val content = page.item

    val author: Author = Author(
      byline = content.trail.byline,
      twitterHandle = content.tags.contributors.headOption.flatMap(_.properties.twitterHandle),
    )

    DotcomRenderingDataModel(
      // TODO sort alphabetically once finished

      version = 3, // Int
      headline = content.trail.headline,
      standfirst = TextCleaner.sanitiseLinks(edition)(content.fields.standfirst.getOrElse("")),
      webTitle = content.metadata.webTitle,
      main = content.fields.main,
      webPublicationDate = content.trail.webPublicationDate.toString,

      // TODO DCR should do these itself
      webPublicationDateDisplay = GUDateTimeFormatNew.formatDateTimeForDisplay(content.trail.webPublicationDate, request),
      webPublicationSecondaryDateDisplay = secondaryDateString(content, request),

      editionLongForm = Edition(request).displayName,
      editionId = edition.id,
      pageId = content.metadata.id,
      format = content.metadata.format.getOrElse(ContentFormat.defaultContentFormat),
      tags = content.tags.tags.map(toDCRTag),
      shouldHideAds = content.content.shouldHideAdverts,
      sectionLabel = Localisation(content.content.sectionLabelName.getOrElse(""))(request),
      sectionUrl = content.content.sectionLabelLink.getOrElse(""),
      sectionName = content.metadata.section.map(_.value),
      subMetaSectionLinks = content.content.submetaLinks.sectionLabels
        .map(SubMetaLink.apply)
        .filter(_.title.trim.nonEmpty),
      subMetaKeywordLinks = content.content.submetaLinks.keywords.map(SubMetaLink.apply),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      webURL = content.metadata.webUrl,
      isCommentable = content.trail.isCommentable,
      isImmersive = content.metadata.format.exists(_.display == ImmersiveDisplay),
      starRating = content.content.starRating,
      trailText = TextCleaner.sanitiseLinks(edition)(content.trail.fields.trailText.getOrElse("")),
      pagination = pagination,
      author = author,
      hasRelated = content.content.showInRelated,
      guardianBaseURL = Configuration.site.host,
      beaconURL = Configuration.debug.beaconUrl,
      publication = content.content.publication,
      contributionsServiceUrl = Configuration.contributionsService.url,
      designType = content.metadata.designType.map(_.toString).getOrElse("Article"),
      pillar = findPillar(content.metadata.pillar, content.metadata.designType),
      twitterData = page.getTwitterProperties,
      openGraphData = page.getOpenGraphProperties,
      linkedData = linkedData,
      nav = nav(page, edition),

      // liveblog specific stuff = extend the model rather than redundant fields?

      mainMediaElements = mainBlock.toList.flatMap(_.elements),
      keyEvents = keyEvents.toList,
      blocks = bodyBlocks,
      config = combinedConfig,
      contentType = jsConfig("contentType").getOrElse(""),
      hasStoryPackage = page.related.hasStoryPackage,
      commercialProperties = commercial.editionCommercialProperties,
      pageType = pageType,
      showBottomSocialButtons = ContentLayout.showBottomSocialButtons(content),
      pageFooter = pageFooter,
      // See pageShouldHideReaderRevenue in contributions-utilities.js
      shouldHideReaderRevenue = content.fields.shouldHideReaderRevenue.getOrElse(isPaidContent),
      slotMachineFlags = request.slotMachineFlags,
      badge = badge,
      matchUrl = makeMatchUrl(page),
      isSpecialReport = isSpecialReport(page),
    )
  }
}
