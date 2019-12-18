package frontpress

import testdata.FaciaPressDeduplicationTestData
import org.scalatest.{FlatSpec, Matchers}

class FaciaPressDeduplicationTest extends FlatSpec with Matchers with FaciaPressDeduplicationTestData {

  var sequence = List(PressedCollectionVisibility(collection0, 0), PressedCollectionVisibility(collection1, 0), PressedCollectionVisibility(collection2, 0), PressedCollectionVisibility(collection3, 0))
  // Note that the integer (0) passed as second argument of PressedCollectionVisibility.apply is irrelevant. We use
  // it because the current version of PressedCollectionDeduplication.deduplication still takes PressedCollectionVisibility

  val newSequence = PressedCollectionDeduplication.deduplication(sequence)

  // What we want to see.

  // 1. The curated elements are never removed

  // 2. Just one element backfilled elements of collection1 is going to be removed (this is because after "link21" is
  // removed, we will be with a collection which has exactly 10 elements)

  // 3. All the backfilled elements of collection3 are going to be removed.

  it should "curated elements are never removed" in {
    newSequence(0).pressedCollection.curated.size shouldBe 4
    newSequence(1).pressedCollection.curated.size shouldBe 8
    newSequence(2).pressedCollection.curated.size shouldBe 22
    newSequence(3).pressedCollection.curated.size shouldBe 11
  }

  it should "remove duplicated backfill'ed content" in {
    newSequence(1).pressedCollection.backfill.size shouldBe 2
    // It is not 1, because we do not deduplicate if resulting in less than 10 elements.
  }

  it should "remove all backfilled contents when possible" in {
    newSequence(3).pressedCollection.backfill shouldBe empty
  }
}
