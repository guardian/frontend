package model

import com.gu.facia.api.models.{FaciaContent, Group}
import org.joda.time.DateTime
import play.api.libs.json.Json

case class PressedCollection(
  id: String,
  displayName: String,
  curated: List[FaciaContent],
  backfill: List[FaciaContent],
  lastUpdated: Option[DateTime],
  updatedBy: Option[String],
  updatedEmail: Option[String],
  href: Option[String],
  apiQuery: Option[String],
  collectionType: String,
  groups: Option[List[Group]],
  uneditable: Boolean,
  showTags: Boolean,
  showSections: Boolean,
  hideKickers: Boolean,
  showDateHeader: Boolean,
  showLatestUpdate: Boolean)

object PressedCollection {
  implicit val pressedCollectionFormat = Json.format[PressedCollection]

  def fromCollectionWithCuratedAndBackfill(
      collection: com.gu.facia.api.models.Collection,
      curated: List[FaciaContent],
      backfill: List[FaciaContent]): PressedCollection =
    PressedCollection(
      collection.id,
      collection.displayName,
      curated,
      backfill,
      collection.lastUpdated,
      collection.updatedBy,
      collection.updatedEmail,
      collection.href,
      collection.apiQuery,
      collection.collectionType,
      collection.groups,
      collection.uneditable,
      collection.showTags,
      collection.showSections,
      collection.hideKickers,
      collection.showDateHeader,
      collection.showLatestUpdate)
}

case class PressedFront(
  path: String,
  seoData: SeoData,
  frontProperties: FrontProperties,
  collections: List[PressedCollection])

object PressedFront {
  implicit val pressedFrontFormat = Json.format[PressedFront]
}
