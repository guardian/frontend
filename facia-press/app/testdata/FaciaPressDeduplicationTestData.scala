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
      "link11",
    ).map(id => pressedContentFromId(id)),
    List(
      "link10",
      "link22",
      "link23"
    ).map(id => pressedContentFromId(id))
  )

  // -----------------------------------------------------
  // Comment for FaciaPressDeduplicationTest:
  // Test that we do not deduplicate below 10 elements [1]
  // We expect backfill to stay even if a duplicate of collection0 backfill
  // -----------------------------------------------------
  val collection1 = collectionFromCuratedAndBackfilled(
    List(
      "link10",
      "link12",
      "link13",
      "link43",
      "link46",
      "link47",
      "link48",
      "link49",
      "link50",
    ).map(id => pressedContentFromId(id)),
    List(
      "link10",
    ).map(id => pressedContentFromId(id))
  )

  // -----------------------------------------------------
  // Comment for FaciaPressDeduplicationTest:
  // Test that we deduplicate against curated and backfilled elements
  // We expect 11 to go because of collection0's curated
  // We expect 22 to go because of collection0's backfilled
  // -----------------------------------------------------
  val collection2 = collectionFromCuratedAndBackfilled(
    List(
      "link11",
      "link12",
      "link13",
      "link43",
      "link46",
      "link47",
      "link48",
      "link49",
      "link50",
      "link51"
    ).map(id => pressedContentFromId(id)),
    List(
      "link11",
      "link22"
    ).map(id => pressedContentFromId(id))
  )

  // -----------------------------------------------------
  // Comment for FaciaPressDeduplicationTest:
  // Test remove backfilled contents when appearing in the previous container as curated
  // .... thereby overidding [1]
  // We expect "link10" in collection4 to go, but "link10" in collection5 to stay
  // -----------------------------------------------------
  val collection3 = collectionFromCuratedAndBackfilled(
    List(
      "link10",
    ).map(id => pressedContentFromId(id)),
    Nil
  )

  val collection4 = collectionFromCuratedAndBackfilled(
    Nil,
    List(
      "link10",
    ).map(id => pressedContentFromId(id))
  )

  val collection5 = collectionFromCuratedAndBackfilled(
    Nil,
    List(
      "link10",
    ).map(id => pressedContentFromId(id))
  )
}
