package frontpress

import testdata.FaciaPressDeduplicationTestData
import org.scalatest.{FlatSpec, Matchers}

class FaciaPressDeduplicationTest extends FlatSpec with Matchers with FaciaPressDeduplicationTestData {

  var sequence = List(
    PressedCollectionVisibility(collection0, 0),
    PressedCollectionVisibility(collection1, 0),
    PressedCollectionVisibility(collection2, 0),
    PressedCollectionVisibility(collection3, 0),
    PressedCollectionVisibility(collection4, 0),
    PressedCollectionVisibility(collection5, 0)
  )
  // Note that the integer (0) passed as second argument of PressedCollectionVisibility.apply is irrelevant. We use
  // it because the current version of PressedCollectionDeduplication.deduplication still takes PressedCollectionVisibility

  val newSequence = PressedCollectionDeduplication.deduplication(sequence)

  it should "never remove curated elements" in {
    newSequence(0).pressedCollection.curated.size shouldBe sequence(0).pressedCollection.curated.size
    newSequence(1).pressedCollection.curated.size shouldBe sequence(1).pressedCollection.curated.size
    newSequence(2).pressedCollection.curated.size shouldBe sequence(2).pressedCollection.curated.size
    newSequence(3).pressedCollection.curated.size shouldBe sequence(3).pressedCollection.curated.size
    newSequence(4).pressedCollection.curated.size shouldBe sequence(4).pressedCollection.curated.size
  }

  it should "not deduplicate backfill'ed content if resulting in less than 10 elements" in {
    newSequence(1).pressedCollection.backfill.size shouldBe 1 // Test that we do not deduplicate below 10 elements [1]
  }

  it should "deduplicate backfill'ed content against curated and backfilled elements" in {
    newSequence(2).pressedCollection.backfill.size shouldBe 0 // Test that we deduplicate against curated and backfilled elements
  }

  it should "force remove backfilled contents when appearing in the previous container as curated (even if less than 10 elements)" in {
    // .... thereby overidding [1]
    newSequence(4).pressedCollection.backfill.size shouldBe 0
    newSequence(5).pressedCollection.backfill.size shouldBe 1
  }
}
