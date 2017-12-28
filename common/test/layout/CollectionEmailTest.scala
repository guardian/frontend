package layout

import common.commercial.FixtureBuilder
import model.facia.PressedCollection
import model.pressed.{CollectionConfig, DisplayHints, PressedContent}
import model.{FrontProperties, PressedPage, SeoData}
import org.scalatest.{FlatSpec, Matchers, OptionValues}
import FixtureBuilder.mkPressedContent

class CollectionEmailTest extends FlatSpec with Matchers with OptionValues {

  it should "respect the maxItemsToDisplay property if set" in {
    val pressedPage = mkPressedPage(
      List(mkPressedCollection(
        id = "1",
        curated = (1 to 4).map(mkContent),
        backfill = (5 to 8).map(mkContent),
        maxItemsToDisplay = Some(8))
      )
    )

    val result = CollectionEmail.fromPressedPage(pressedPage)
    result.contentCollections.headOption.map(_.cards.length) shouldEqual Some(8)
  }

  it should "exclude empty containers" in {
    val pressedPage = mkPressedPage(
      List(
        mkPressedCollection(id = "1", curated = (10 to 12).map(mkContent), backfill = (13 to 15).map(mkContent)),
        mkPressedCollection(id = "2", curated = Nil, backfill = Nil),
        mkPressedCollection(id = "3", curated = (30 to 32).map(mkContent), backfill = (33 to 35).map(mkContent))
      )
    )

    val result = CollectionEmail.fromPressedPage(pressedPage)
    result.collections.length shouldEqual 2
    result.contentCollections.map(_.displayName) shouldEqual List("Test Collection 1", "Test Collection 3")
  }

  private def mkContent(id: Int): PressedContent = mkPressedContent(id)

  private def mkPressedCollection(id: String, curated: Seq[PressedContent] = IndexedSeq.empty, backfill: Seq[PressedContent] = IndexedSeq.empty, maxItemsToDisplay: Option[Int] = None) = {
    PressedCollection(
      id = "test-colleciton",
      displayName = s"Test Collection $id",
      curated = curated.toList,
      backfill = backfill.toList,
      treats = List.empty,
      lastUpdated = None,
      href = None,
      description = None,
      collectionType = "unknown",
      groups = None,
      uneditable = false,
      showTags = false,
      showSections = false,
      hideKickers = false,
      showDateHeader = false,
      showLatestUpdate = false,
      config = CollectionConfig.empty.copy(displayHints = maxItemsToDisplay.map(m => DisplayHints(Some(m)))),
      hasMore = false
    )
  }

  private def mkPressedPage(collections: List[PressedCollection]) = {
    PressedPage(
      id = "test-pressed-page",
      seoData = SeoData.empty,
      frontProperties= FrontProperties.empty,
      collections = collections
    )
  }
}
