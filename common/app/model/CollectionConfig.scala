package model.pressed

import com.gu.facia.api.{models => fapi}
import com.gu.facia.client.models.{Backfill, CollectionConfigJson, Metadata, CollectionPlatform, Secondary}

final case class CollectionConfig(
    displayName: Option[String],
    backfill: Option[Backfill],
    metadata: Option[Seq[Metadata]],
    collectionType: String,
    collectionLevel: Option[String],
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
    aspectRatio: Option[String],
)

object CollectionConfig {

  def make(config: fapi.CollectionConfig): CollectionConfig = {

    val betaCollections = List(
      "flexible/special",
      "flexible/general",
      "scrollable/highlights",
      "scrollable/small",
      "scrollable/medium",
      "scrollable/feature",
      "static/medium/4",
      "static/feature/2",
    )

    /** Collection level is a concept that allows the platforms to style containers differently based on their "level".
      * Beta collections are "Secondary" if tagged as such or "Primary" otherwise. Legacy containers have no container
      * level set.
      */
    val collectionLevel: Option[String] = if (betaCollections.contains(config.collectionType)) {
      config.metadata.getOrElse(List.empty).find(_ == Secondary) match {
        case Some(_) => Some("Secondary")
        case None    => Some("Primary")
      }
    } else {
      None
    }

    val aspectRatio: String = fapi.CollectionConfig.getAspectRatio(config).label

    CollectionConfig(
      displayName = config.displayName,
      backfill = config.backfill,
      metadata = config.metadata,
      collectionType = config.collectionType,
      collectionLevel = collectionLevel,
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
      aspectRatio = Some(aspectRatio),
    )
  }

  def make(collectionJson: CollectionConfigJson): CollectionConfig = {
    CollectionConfig.make(fapi.CollectionConfig.fromCollectionJson(collectionJson))
  }

  val empty = make(fapi.CollectionConfig.empty)
}
