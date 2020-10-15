package model.dotcomrendering

import common.commercial.EditionCommercialProperties
import model.dotcomrendering.pageElements.PageElement
import play.api.libs.json._

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
    editionLongForm: String,
    editionId: String,
    pageId: String,
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
    designType: String,
    showBottomSocialButtons: Boolean,
    pageFooter: PageFooter,
    publication: String,
    shouldHideReaderRevenue: Boolean,
    // slot machine (temporary for contributions development)
    slotMachineFlags: String,
    contributionsServiceUrl: String,
    badge: Option[DCRBadge],
    // Match Data
    matchUrl: Option[String], // Optional url used for match data
)

object DotcomRenderingDataModel {

  implicit val pageElementWrites = PageElement.pageElementWrites

  implicit val writes = new Writes[DotcomRenderingDataModel] {
    def writes(model: DotcomRenderingDataModel) =
      Json.obj(
        "version" -> model.version,
        "headline" -> model.headline,
        "standfirst" -> model.standfirst,
        "webTitle" -> model.webTitle,
        "mainMediaElements" -> Json.toJson(model.mainMediaElements),
        "main" -> model.main,
        "keyEvents" -> model.keyEvents,
        "blocks" -> model.blocks,
        "pagination" -> model.pagination,
        "author" -> model.author,
        "webPublicationDate" -> model.webPublicationDate,
        "webPublicationDateDisplay" -> model.webPublicationDateDisplay,
        "editionLongForm" -> model.editionLongForm,
        "editionId" -> model.editionId,
        "pageId" -> model.pageId,
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
        "designType" -> model.designType,
        "showBottomSocialButtons" -> model.showBottomSocialButtons,
        "pageFooter" -> model.pageFooter,
        "publication" -> model.publication,
        "shouldHideReaderRevenue" -> model.shouldHideReaderRevenue,
        "slotMachineFlags" -> model.slotMachineFlags,
        "contributionsServiceUrl" -> model.contributionsServiceUrl,
        "badge" -> model.badge,
        "matchUrl" -> model.matchUrl,
      )
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
}
