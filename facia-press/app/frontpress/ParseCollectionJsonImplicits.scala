package services

import com.gu.contentapi.client.model._
import play.api.libs.json.Json

object ParseCollectionJsonImplicits {
  implicit val podcastFormats = Json.format[Podcast]
  implicit val referenceFormats = Json.format[Reference]
  implicit val tagFormats = Json.format[Tag]
  implicit val mediaEncodingFormats = Json.format[MediaEncoding]
  implicit val assetFormats = Json.format[Asset]
  implicit val elementFormats = Json.format[Element]
  implicit val contentFormats = Json.format[Content]
  implicit val editionFormats = Json.format[Edition]
  implicit val sectionFormats = Json.format[Section]
  implicit val itemResponseFormats = Json.format[ItemResponse]
  implicit val searchResponseFormats = Json.format[SearchResponse]
  implicit val resultFormats = Json.format[Result]
}
