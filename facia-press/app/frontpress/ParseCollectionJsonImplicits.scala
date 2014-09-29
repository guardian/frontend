package services

import com.gu.openplatform.contentapi.model._
import play.api.libs.json.Json

object ParseCollectionJsonImplicits {
  implicit val podcastFormats = Json.format[Podcast]
  implicit val referenceFormats = Json.format[Reference]
  implicit val tagFormats = Json.format[Tag]
  implicit val factBoxFormats = Json.format[Factbox]
  implicit val mediaEncodingFormats = Json.format[MediaEncoding]
  implicit val mediaAssetFormats = Json.format[MediaAsset]
  implicit val assetFormats = Json.format[Asset]
  implicit val elementFormats = Json.format[Element]
  implicit val contentFormats = Json.format[Content]

  implicit val editionFormats = Json.format[Edition]
  implicit val sectionFormats = Json.format[Section]

  implicit val refinementFormats = Json.format[Refinement]
  implicit val refinementGroupFormats = Json.format[RefinementGroup]
  implicit val bestBetsFormats = Json.format[BestBet]

  implicit val itemResponseFormats = Json.format[ItemResponse]
  implicit val searchResponseFormats = Json.format[SearchResponse]

  implicit val resultFormats = Json.format[Result]
}
