package model.pressed

import com.gu.facia.api.{models => fapi}
import com.gu.facia.client.models.{Backfill, CollectionConfigJson, CollectionPlatform, Metadata}
import model.PressedCollectionFormat

final case class CollectionConfig(
    displayName: Option[String],
    backfill: Option[Backfill],
    metadata: Option[Seq[Metadata]],
    collectionType: String,
    href: Option[String],
    description: Option[String],
    groups: Option[List[String]],
    uneditable: Boolean,
    showTags: Boolean,
    showSections: Boolean,
    hideKickers: Boolean,
    showDateHeader: Boolean,
    showLatestUpdate: Boolean,
    excludeFromRss: Boolean,
    showTimestamps: Boolean,
    hideShowMore: Boolean,
    displayHints: Option[DisplayHints],
    platform: Option[CollectionPlatform] = None,
)

object CollectionConfig {
  implicit val collectionConfigFormat = PressedCollectionFormat.collectionConfigFormat

  def make(config: fapi.CollectionConfig): CollectionConfig = {
    CollectionConfig(
      displayName = config.displayName,
      backfill = config.backfill,
      metadata = config.metadata,
      collectionType = config.collectionType,
      href = config.href,
      description = config.description,
      groups = config.groups.map(_.groups),
      uneditable = config.uneditable,
      showTags = config.showTags,
      showSections = config.showSections,
      hideKickers = config.hideKickers,
      showDateHeader = config.showDateHeader,
      showLatestUpdate = config.showLatestUpdate,
      excludeFromRss = config.excludeFromRss,
      showTimestamps = config.showTimestamps,
      hideShowMore = config.hideShowMore,
      displayHints = config.displayHints.map(DisplayHints.make),
      platform = Some(config.platform),
    )
  }

  def make(collectionJson: CollectionConfigJson): CollectionConfig = {
    CollectionConfig.make(fapi.CollectionConfig.fromCollectionJson(collectionJson))
  }

  val empty = make(fapi.CollectionConfig.empty)
}
