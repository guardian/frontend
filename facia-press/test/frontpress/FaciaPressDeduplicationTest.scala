package frontpress

import testdata.FaciaPressDeduplicationTestData
import org.scalatest.{FlatSpec, Matchers}

class FaciaPressDeduplicationTest extends FlatSpec with Matchers with FaciaPressDeduplicationTestData {

  var sequence = List(
    PressedCollectionVisibility(collection0, 0),
    PressedCollectionVisibility(collection1, 0),
    PressedCollectionVisibility(collection2, 0),
    PressedCollectionVisibility(collection3, 0),
    PressedCollectionVisibility(collection4, 0)
  )
  // Note that the integer (0) passed as second argument of PressedCollectionVisibility.apply is irrelevant. We use
  // it because the current version of PressedCollectionDeduplication.deduplication still takes PressedCollectionVisibility

  val newSequence = PressedCollectionDeduplication.deduplication(sequence)

  // What we want to see.

  // 1. The curated elements are never removed

  // 2. Just one element backfilled elements of collection1 is going to be removed (this is because after "link21" is
  // removed, we will be with a collection which has exactly 10 elements)

  // 3. All the backfilled elements of collection3 are going to be removed.

  it should "never remove curated elements" in {
    newSequence(0).pressedCollection.curated.size shouldBe sequence(0).pressedCollection.curated.size
    newSequence(1).pressedCollection.curated.size shouldBe sequence(1).pressedCollection.curated.size
    newSequence(2).pressedCollection.curated.size shouldBe sequence(2).pressedCollection.curated.size
    newSequence(3).pressedCollection.curated.size shouldBe sequence(3).pressedCollection.curated.size
    newSequence(4).pressedCollection.curated.size shouldBe sequence(4).pressedCollection.curated.size
  }

  it should "deduplicate backfill'ed content" in {
    newSequence(1).pressedCollection.backfill.size shouldBe 1 // Test that we do not deduplicate below 10 elements
    newSequence(2).pressedCollection.backfill.size shouldBe 0 // Test that we deduplicated against curated and backfilled elements
  }

  it should "remove all backfilled contents when possible" in {
    // newSequence(3).pressedCollection.backfill shouldBe empty
  }
}
