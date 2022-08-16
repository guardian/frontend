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
      fields = Some(ContentFields(liveBloggingNow = Some(true))),
    )
    FaciaContentConvert.contentToFaciaContent(content)
  }

  def collectionFromCuratedAndBackfilled(
      curated: List[PressedContent],
      backfilled: List[PressedContent],
  ): PressedCollection = {
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
      targetedTerritory = None,
    )
  }

  // -----------------------------------------------------
  // Comment for FaciaPressDeduplicationTest:
  // collection1 is used to test that we do not touch curated elements and that we deduplicate backfilled elements
  // We expect: curated of size 2, backfill of size 3
  // -----------------------------------------------------
  val collection0 = collectionFromCuratedAndBackfilled(
    List(
      "link10",
      "link11",
    ).map(id => pressedContentFromId(id)),
    List(
      "link20",
      "link22",
      "link23",
    ).map(id => pressedContentFromId(id)),
  )

  // -----------------------------------------------------
  // Comment for FaciaPressDeduplicationTest:
  // collection1 is used to test that we do not touch curated elements and that we deduplicate backfilled elements
  // We expect: curated of size 3, backfill of size 1 ("link24")
  // -----------------------------------------------------
  val collection1 = collectionFromCuratedAndBackfilled(
    List(
      "link10",
      "link11",
      "link12",
    ).map(id => pressedContentFromId(id)),
    List(
      "link20",
      "link22",
      "link23",
      "link24",
    ).map(id => pressedContentFromId(id)),
  )

  // -----------------------------------------------------
  // Comment for FaciaPressDeduplicationTest:
  // collection2 is used to test that we do not touch curated elements and that we deduplicate backfilled elements
  // We expect: curated of size 3, backfill of size 2 ("link25", "link26")
  // -----------------------------------------------------
  val collection2 = collectionFromCuratedAndBackfilled(
    List(
      "link11",
      "link12",
      "link20",
    ).map(id => pressedContentFromId(id)),
    List(
      "link23",
      "link25",
      "link26",
    ).map(id => pressedContentFromId(id)),
  )

  // -----------------------------------------------------
  // Comment for FaciaPressDeduplicationTest:
  // collection3 is a variation of collection 1
  // collection3 is used to demonstrate that the Most Popular container is not deduplicated
  // -----------------------------------------------------
  val collection3 = collection1.copy(
    config = collection1.config.copy(
      collectionType = "news/most-popular",
    ),
  )

  // -----------------------------------------------------
  // Comment for FaciaPressDeduplicationTest:
  // collection4 is used to test that backfills are deduped against curated
  // from the same collection, as well as previous collections.
  // -----------------------------------------------------
  val collection4 = collectionFromCuratedAndBackfilled(
    List(
      "link99",
      "link98",
      "link97",
    ).map(id => pressedContentFromId(id)),
    List(
      "link97",
      "link96",
      "link95",
    ).map(id => pressedContentFromId(id)),
  )

}
