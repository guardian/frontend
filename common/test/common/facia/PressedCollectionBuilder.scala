package common.facia

import FixtureBuilder.mkPressedContent
import com.gu.facia.client.models.TargetedTerritory
import model.facia.PressedCollection
import model.pressed.{CollectionConfig, PressedContent}

object PressedCollectionBuilder {
  private val defaultCurated = List(mkPressedContent(1), mkPressedContent(2), mkPressedContent(3))
  private val defaultBackfill = List(mkPressedContent(4), mkPressedContent(5))

  def mkPressedCollection(
      collectionType: String = "collectionType",
      curated: List[PressedContent] = defaultCurated,
      backfill: List[PressedContent] = defaultBackfill,
      hideShowMore: Boolean = false,
      targetedTerritory: Option[TargetedTerritory] = None,
  ): PressedCollection = {

    val config: CollectionConfig = CollectionConfig(
      displayName = None,
      backfill = None,
      metadata = None,
      collectionType = "",
      href = None,
      description = None,
      groups = None,
      uneditable = false,
      showTags = false,
      showSections = false,
      hideKickers = false,
      showDateHeader = false,
      showLatestUpdate = false,
      excludeFromRss = false,
      showTimestamps = false,
      hideShowMore,
      displayHints = None,
    )

    PressedCollection(
      id = "test-collection-id",
      displayName = "test-collection-displayName",
      curated,
      backfill,
      treats = Nil,
      lastUpdated = None,
      href = Some(
        "/am-resorts-partner-zone/2016/jan/20/be-a-hero-on-the-half-shell-release-baby-turtles-on-your-next-vacation",
      ),
      description = Some("desc"),
      collectionType,
      groups = None,
      uneditable = false,
      showTags = false,
      showSections = false,
      hideKickers = false,
      showDateHeader = false,
      showLatestUpdate = false,
      config,
      hasMore = false,
      targetedTerritory = targetedTerritory,
    )
  }
}
