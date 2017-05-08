package layout

import common.commercial.FixtureBuilder
import model.facia.PressedCollection
import model.pressed.{CollectionConfig, DisplayHints, PressedContent}
import model.{FrontProperties, PressedPage, SeoData}
import org.scalatest.{FlatSpec, Matchers, OptionValues}
import FixtureBuilder.mkPressedContent

class CollectionEmailTest extends FlatSpec with Matchers with OptionValues {
  it should "deduplicate content" in {
    val duplicatedA = mkPressedContent(99)
    val duplicatedB = mkPressedContent(88)

    val pressedPage = mkPressedPage(
      List(
        mkPressedCollection(id = "1", curated = List(duplicatedA, mkContent(1)), backfill = List(mkContent(2))),
        mkPressedCollection(id = "2", curated = List(mkContent(3)), backfill = List(duplicatedA, duplicatedB, mkContent(4))),
        mkPressedCollection(id = "3", curated = List(duplicatedA, duplicatedB, mkContent(5)), backfill = List(mkContent(6)))
      )
    )

    val result = CollectionEmail.fromPressedPage(pressedPage)
    result.contentCollections(1).cards.map(_.header.url) should not contain EditionalisedLink("/99")
    result.contentCollections(2).cards.map(_.header.url) should contain noneOf(EditionalisedLink("/99"), EditionalisedLink("/88"))
  }

  it should "default to 6 items per collection" in {
    val pressedPage = mkPressedPage(
      List(
        mkPressedCollection(
          id = "1",
          curated = (1 to 4).map(mkContent),
          backfill = (5 to 8).map(mkContent))
      )
    )

    val result = CollectionEmail.fromPressedPage(pressedPage)
    result.contentCollections.headOption.map(_.cards.length) shouldEqual Some(6)
  }

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
        mkPressedCollection(id = "2", curated = (10 to 12).map(mkContent), backfill = (13 to 15).map(mkContent)),
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
      updatedBy = None,
      updatedEmail = None,
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
      config = CollectionConfig.empty.copy(displayHints = maxItemsToDisplay.map(m => DisplayHints(Some(m))))
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
