package model.dotcomrendering

import common.commercial.EditionCommercialProperties
import model.dotcomrendering.pageElements.PageElement
import navigation.Nav
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
    webPublicationSecondaryDateDisplay: String,
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
    isSpecialReport: Boolean, // Indicates whether the page is a special report.
)

object ElementsEnhancer {

  /*
    Originally the TextBlockElement, for instance, comes like this:

    {
        "_type": "model.dotcomrendering.pageElements.TextBlockElement",
        "html": "<p>Something</p>"
    }

    But there is a request from DCR to add a `renderId` attribute, whose value is a random string to it, for instance

    {
        "renderId": "b11904da-4f57-4320-bdde-800e55825d1d",
        "_type": "model.dotcomrendering.pageElements.TextBlockElement",
        "html": "<p>Something</p>"
    }

    This request does not only apply to TextBlockElement, but to each variant of the PageElement trait.

    There were two ways to implement this:

    1. Update the type of each PageElement case class to have a new renderId field, and use a value when initializing the
       case class.

    2. What we are doing here: adding that field as a transformation applied to PageElements during the Json
       serialisation.

    We decided to go for solution 2, because `renderId` doesn't itself have real semantics for backend types. It' ok
       for the backend to provide the field to DCR from the backend but doing it at json serialization seems the right
       place to perform that operation.
   */

  def enhanceElement(element: JsValue): JsValue = {
    // Note: the value of renderId is used to link serverside and client side elements together for portals and
    // hydration which was previously done with the array index (brittle, particularly when now dealing with main
    // media array too). The actual value is irrelevant and can vary from one call to another. Here we are using UUIDs

    element.as[JsObject] ++ Json.obj("elementId" -> java.util.UUID.randomUUID.toString)
  }

  def enhanceElements(elements: JsValue): IndexedSeq[JsValue] = {
    elements.as[JsArray].value.map(element => enhanceElement(element))
  }

  def enhanceBlock(block: JsValue): JsValue = {
    val elements = block.as[JsObject].value("elements")
    block.as[JsObject] ++ Json.obj("elements" -> enhanceElements(elements))
  }

  def enhanceBlocks(blocks: JsValue): IndexedSeq[JsValue] = {
    blocks.as[JsArray].value.map(block => enhanceBlock(block))
  }

  def enhanceDcrObject(obj: JsObject): JsObject = {
    obj ++ Json.obj("blocks" -> enhanceBlocks(obj.value("blocks")))
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
        "mainMediaElements" -> Json.toJson(model.mainMediaElements),
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
        "isSpecialReport" -> model.isSpecialReport,
      )

      // The following line essentially performs the "update" of the `elements` objects inside the `blocks` objects
      // using functions of the ElementsEnhancer object.
      // See comments in ElementsEnhancer for a full context of why this happens.
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
}
