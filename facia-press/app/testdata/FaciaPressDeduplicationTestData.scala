package testdata

import java.time.ZoneOffset
import com.gu.contentapi.client.model.v1.{ContentFields, Content => ApiContent}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import model.facia.PressedCollection
import implicits.Dates.jodaToJavaInstant
import model.pressed.{CollectionConfig, PressedContent}
import org.joda.time.DateTime
import services.FaciaContentConvert

trait FaciaPressDeduplicationTestData {

  def pressedContentFromId(u: String): PressedContent = {
    val content = ApiContent(
      id = u,
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(jodaToJavaInstant(DateTime.now).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = "",
      webUrl = "",
      apiUrl = "",
      elements = None,
      fields = Some(ContentFields(liveBloggingNow = Some(true)))
    )
    FaciaContentConvert.contentToFaciaContent(content)
  }

  def collectionFromCuratedAndBackfilled(curated: List[PressedContent], backfilled: List[PressedContent]): PressedCollection = {
    PressedCollection(
      id = "collection/id/1",
      displayName = "",
      curated = curated,
      backfill = backfilled,
      treats = Nil,
      lastUpdated = None,
      href = None,
      description = None,
      collectionType = "",
      groups = None,
      uneditable = false,
      showTags = false,
      showSections = false,
      hideKickers = false,
      showDateHeader = false,
      showLatestUpdate = false,
      config = CollectionConfig.empty,
      hasMore = false,
      targetedTerritory = None
    )
  }

  val collection0 = collectionFromCuratedAndBackfilled(
    List(
      "link10",
      "link11",
      "link12",
      "link13",
    ).map(id => pressedContentFromId(id)),
    List(
      "link22",
      "link23"
    ).map(id => pressedContentFromId(id))
  )

  val collection1 = collectionFromCuratedAndBackfilled(
    List(
      "link43",
      "link44",
      "link45",
      "link46",
      "link47",
      "link48",
      "link49",
      "link50",
    ).map(id => pressedContentFromId(id)),
    List(
      "link21",
      "link22",
      "link23"
    ).map(id => pressedContentFromId(id))
  )

  val collection2 = collectionFromCuratedAndBackfilled(
    List(
      "link30",
      "link31",
      "link32",
      "link33",
      "link34",
      "link35",
      "link36",
      "link37",
      "link38",
      "link39",
      "link40",
      "link41",
      "link42",
      "link43",
      "link44",
      "link45",
      "link46",
      "link47",
      "link48",
      "link49",
      "link50"
    ).map(id => pressedContentFromId(id)),
    Nil
  )

  val collection3 = collectionFromCuratedAndBackfilled(
    List(
      "link30",
      "link31",
      "link32",
      "link33",
      "link34",
      "link35",
      "link36",
      "link37",
      "link38",
      "link39",
      "link40"
    ).map(id => pressedContentFromId(id)),
    List(
      "link41",
      "link42",
      "link43",
      "link44",
      "link45",
      "link46",
      "link47",
      "link48",
      "link49",
      "link50"
    ).map(id => pressedContentFromId(id))
  )

  // What we want to see.

  // 1. The curated elements are never removed

  // 2. Just one element backfilled elements of collection1 is going to be removed (this is because after "link21" is
  // removed, we will be with a collection which has exactly 10 elements)

  // 3. All the backfilled elements of collection3 are going to be removed.
}
