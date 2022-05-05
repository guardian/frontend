package frontpress

import org.scalatest.flatspec.AnyFlatSpec
import testdata.FaciaPressDeduplicationTestData
import org.scalatest.matchers.should.Matchers

class FaciaPressDeduplicationTest extends AnyFlatSpec with Matchers with FaciaPressDeduplicationTestData {

  var sequence = List(
    PressedCollectionVisibility(collection0, 0),
    PressedCollectionVisibility(collection1, 0),
    PressedCollectionVisibility(collection2, 0),
    PressedCollectionVisibility(collection3, 0),
  )
  // Note that the integer (0) passed as second argument of PressedCollectionVisibility.apply is irrelevant. We use
  // it because the current version of PressedCollectionDeduplication.deduplication still takes PressedCollectionVisibility

  val newSequence = PressedCollectionDeduplication.deduplication(sequence)

  it should "never remove curated elements" in {
    newSequence(0).pressedCollection.curated.size shouldBe sequence(0).pressedCollection.curated.size
    newSequence(1).pressedCollection.curated.size shouldBe sequence(1).pressedCollection.curated.size
    newSequence(2).pressedCollection.curated.size shouldBe sequence(2).pressedCollection.curated.size
    newSequence(3).pressedCollection.curated.size shouldBe sequence(3).pressedCollection.curated.size
  }

  it should "deterministically deduplicate backfill'ed content against curated and backfilled elements" in {
    newSequence(0).pressedCollection.backfill.size shouldBe 3
    newSequence(1).pressedCollection.backfill.size shouldBe 1
    newSequence(1).pressedCollection.backfill(0).header.url shouldEqual "/link24"
    newSequence(2).pressedCollection.backfill.size shouldBe 2
    newSequence(2).pressedCollection.backfill(0).header.url shouldEqual "/link25"
    newSequence(2).pressedCollection.backfill(1).header.url shouldEqual "/link26"
  }

  it should "not deduplicate Most Popular containers" in {
    newSequence(3).pressedCollection.backfill.size shouldBe sequence(3).pressedCollection.backfill.size
  }
}
