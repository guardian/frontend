package model.facia

import com.gu.commercial.branding.ContainerBranding
import com.gu.facia.api.{FAPI, models => fapi}
import com.gu.facia.api.models.GroupsConfig
import com.gu.facia.api.utils.BoostLevel.Boost
import com.gu.facia.api.utils.{BoostLevel, ContainerBrandingFinder}
import com.gu.facia.client.models.{Branded, TargetedTerritory}
import common.Edition
import model.pressed._
import org.joda.time.DateTime
import services.CollectionConfigWithId

case class PressedCollection(
    id: String,
    displayName: String,
    curated: List[PressedContent],
    backfill: List[PressedContent],
    treats: List[PressedContent],
    lastUpdated: Option[DateTime],
    href: Option[String],
    description: Option[String],
    collectionType: String,
    uneditable: Boolean,
    showTags: Boolean,
    showSections: Boolean,
    hideKickers: Boolean,
    showDateHeader: Boolean,
    showLatestUpdate: Boolean,
    config: CollectionConfig,
    hasMore: Boolean,
    targetedTerritory: Option[TargetedTerritory],
) {

  lazy val isEmpty: Boolean = curated.isEmpty && backfill.isEmpty && treats.isEmpty

  lazy val adFree = {
    copy(
      curated = curated.filterNot(_.isPaidFor),
      backfill = backfill.filterNot(_.isPaidFor),
      treats = treats.filterNot(_.isPaidFor),
    )
  }

  def withoutTrailTextOnTail: PressedCollection =
    (curated, backfill) match {
      case (curatedHead :: tail, _) =>
        copy(curated = curatedHead :: tail.map(_.withoutTrailText), backfill = backfill.map(_.withoutTrailText))
      case (_, backfillHead :: tail) => copy(backfill = backfillHead :: tail.map(_.withoutTrailText))
      case _                         => this
    }

  def totalSize: Int = curated.size + backfill.size

  lazy val withDefaultBoostLevels = {
    val (defaultBoostCurated, defaultBoostBackfill) = FAPI
      .applyDefaultBoostLevels[PressedContent](
        groupsConfig = config.groupsConfig,
        collectionType = config.collectionType,
        contents = curated ++ backfill,
        getBoostLevel = _.display.boostLevel.getOrElse(BoostLevel.Default),
        setBoostLevel = (content, level) => content.withBoostLevel(Some(level)),
      )
      .splitAt(curated.length)

    copy(curated = defaultBoostCurated, backfill = defaultBoostBackfill)
  }

  def lite(visible: Int): PressedCollection = {
    val liteCurated = curated.take(visible)
    val liteBackfill = backfill.take(visible - liteCurated.length)
    val hasMore = curatedPlusBackfillDeduplicated.length > visible
    copy(curated = liteCurated, backfill = liteBackfill, hasMore = hasMore)
  }

  def full(visible: Int): PressedCollection = {
    val hasMore = curatedPlusBackfillDeduplicated.length > visible
    copy(hasMore = hasMore)
  }

  lazy val collectionConfigWithId = CollectionConfigWithId(id, config)

  lazy val curatedPlusBackfillDeduplicated = (curated ++ backfill).distinctBy { c =>
    c.properties.maybeContentId.getOrElse(c.card.id)
  }

  lazy val distinct = curatedPlusBackfillDeduplicated.distinctBy(_.header.url)

  def branding(edition: Edition): Option[ContainerBranding] = {
    ContainerBrandingFinder.findBranding(
      isConfiguredForBranding = config.metadata.exists(_.contains(Branded)),
      optBrandings = curatedPlusBackfillDeduplicated.map(_.branding(edition)).toSet,
    )
  }
}

object PressedCollection {

  def fromCollectionWithCuratedAndBackfill(
      collection: com.gu.facia.api.models.Collection,
      curated: List[PressedContent],
      backfill: List[PressedContent],
      treats: List[PressedContent],
  ): PressedCollection =
    PressedCollection(
      collection.id,
      collection.displayName,
      curated,
      backfill,
      treats,
      collection.lastUpdated,
      collection.href,
      collection.collectionConfig.description,
      collection.collectionConfig.collectionType,
      collection.collectionConfig.uneditable,
      collection.collectionConfig.showTags,
      collection.collectionConfig.showSections,
      collection.collectionConfig.hideKickers,
      collection.collectionConfig.showDateHeader,
      collection.collectionConfig.showLatestUpdate,
      CollectionConfig.make(collection.collectionConfig),
      hasMore = false,
      collection.collectionConfig.targetedTerritory,
    )
}
