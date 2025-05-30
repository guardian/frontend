package common.facia

import FixtureBuilder.mkPressedCuratedContent
import com.gu.facia.client.models.TargetedTerritory
import model.facia.PressedCollection
import model.pressed.{CollectionConfig, PressedContent}

object PressedCollectionBuilder {
  private val defaultCurated = List(mkPressedCuratedContent(1), mkPressedCuratedContent(2), mkPressedCuratedContent(3))
  private val defaultBackfill = List(mkPressedCuratedContent(4), mkPressedCuratedContent(5))

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
      collectionLevel = None,
      href = None,
      description = None,
      groupsConfig = None,
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
      aspectRatio = Some(""),
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
