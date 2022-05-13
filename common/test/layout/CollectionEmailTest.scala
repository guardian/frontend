package layout

import common.facia.FixtureBuilder
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.OptionValues
import org.scalatest.matchers.should.Matchers

class CollectionEmailTest extends AnyFlatSpec with Matchers with OptionValues {

  it should "respect the maxItemsToDisplay property if set" in {
    val pressedPage = FixtureBuilder.mkPressedPage(
      List(
        FixtureBuilder.mkPressedCollection(
          id = "1",
          curated = (1 to 4).map(FixtureBuilder.mkContent),
          backfill = (5 to 8).map(FixtureBuilder.mkContent),
          maxItemsToDisplay = Some(8),
        ),
      ),
    )

    val result = CollectionEmail.fromPressedPage(pressedPage)
    result.contentCollections.headOption.map(_.cards.length) shouldEqual Some(8)
  }

  it should "exclude empty containers" in {
    val pressedPage = FixtureBuilder.mkPressedPage(
      List(
        FixtureBuilder.mkPressedCollection(
          id = "1",
          curated = (10 to 12).map(FixtureBuilder.mkContent),
          backfill = (13 to 15).map(FixtureBuilder.mkContent),
        ),
        FixtureBuilder.mkPressedCollection(id = "2", curated = Nil, backfill = Nil),
        FixtureBuilder.mkPressedCollection(
          id = "3",
          curated = (30 to 32).map(FixtureBuilder.mkContent),
          backfill = (33 to 35).map(FixtureBuilder.mkContent),
        ),
      ),
    )

    val result = CollectionEmail.fromPressedPage(pressedPage)
    result.collections.length shouldEqual 2
    result.contentCollections.map(_.displayName) shouldEqual List("Test Collection 1", "Test Collection 3")
  }

}
