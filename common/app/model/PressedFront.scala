package model.facia

import com.gu.facia.api.{models => fapi}
import implicits.CollectionsOps._
import model.pressed._
import org.joda.time.DateTime
import play.api.libs.json._
import services.CollectionConfigWithId

case class PressedCollection(
  id: String,
  displayName: String,
  curated: List[PressedContent],
  backfill: List[PressedContent],
  treats: List[PressedContent],
  lastUpdated: Option[DateTime],
  updatedBy: Option[String],
  updatedEmail: Option[String],
  href: Option[String],
  description: Option[String],
  apiQuery: Option[String],
  collectionType: String,
  groups: Option[List[String]],
  uneditable: Boolean,
  showTags: Boolean,
  showSections: Boolean,
  hideKickers: Boolean,
  showDateHeader: Boolean,
  showLatestUpdate: Boolean,
  config: CollectionConfig) {

  lazy val collectionConfigWithId = CollectionConfigWithId(id, config)

  lazy val curatedPlusBackfillDeduplicated = (curated ++ backfill).distinctBy(c => c.properties.maybeContentId.getOrElse(c.properties.id))
}

object PressedCollection {
  implicit val pressedCollectionFormat = Json.format[PressedCollection]

  def fromCollectionWithCuratedAndBackfill(
      collection: com.gu.facia.api.models.Collection,
      curated: List[PressedContent],
      backfill: List[PressedContent],
      treats: List[PressedContent]): PressedCollection =
    PressedCollection(
      collection.id,
      collection.displayName,
      curated,
      backfill,
      treats,
      collection.lastUpdated,
      collection.updatedBy,
      collection.updatedEmail,
      collection.href,
      collection.collectionConfig.description,
      collection.collectionConfig.apiQuery,
      collection.collectionConfig.collectionType,
      collection.collectionConfig.groups.map(groups => fapi.Group.fromGroups(groups).map(_.toString)),
      collection.collectionConfig.uneditable,
      collection.collectionConfig.showTags,
      collection.collectionConfig.showSections,
      collection.collectionConfig.hideKickers,
      collection.collectionConfig.showDateHeader,
      collection.collectionConfig.showLatestUpdate,
      CollectionConfig.make(collection.collectionConfig))
}
