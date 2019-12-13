package frontpress

import testdata.FaciaPressDeduplicationTestData
import org.scalatest.{FlatSpec, Matchers}

class FaciaPressDeduplicationTest extends FlatSpec with Matchers with FaciaPressDeduplicationTestData {

  var sequence = List(PressedCollectionVisibility(collection0, 0), PressedCollectionVisibility(collection1, 0), PressedCollectionVisibility(collection2, 0), PressedCollectionVisibility(collection3, 0))
  // Note that the integer (0) passed as second argument of PressedCollectionVisibility.apply is irrelevant. We use
  // it because the current version of PressedCollectionDeduplication.deduplication still takes PressedCollectionVisibility

  val newSequence = PressedCollectionDeduplication.deduplication(sequence)

  it should "curated elements are never removed" in {
    newSequence(0).pressedCollection.curated.size shouldBe 4
    newSequence(1).pressedCollection.curated.size shouldBe 8
    newSequence(2).pressedCollection.curated.size shouldBe 21
    newSequence(3).pressedCollection.curated.size shouldBe 11
  }

  it should "remove duplicated backfill'ed content" in {
    newSequence(1).pressedCollection.backfill.size shouldBe 2
  }

  it should "remove all backfilled contents when possible" in {
    newSequence(3).pressedCollection.backfill shouldBe empty
  }
}
