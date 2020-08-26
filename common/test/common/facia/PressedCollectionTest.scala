package common.facia

import org.scalatest.{FlatSpec, Matchers}

class PressedCollectionTest extends FlatSpec with Matchers {
  "withoutTrailTextOnTail" should "remove trail text from curated and backfill content, leaving the curated head" in {
    val pressedCollection = PressedCollectionBuilder.mkPressedCollection()
    val withoutTrailText = pressedCollection.withoutTrailTextOnTail

    withoutTrailText.curatedPlusBackfillDeduplicated shouldBe
      pressedCollection.curatedPlusBackfillDeduplicated.head :: pressedCollection.curatedPlusBackfillDeduplicated.tail
        .map(_.withoutTrailText)
  }

  "withoutTrailTextOnTail" should "remove trail text from backfill content, leaving the backfill head" in {
    val pressedCollection = PressedCollectionBuilder.mkPressedCollection(curated = Nil)
    val withoutTrailText = pressedCollection.withoutTrailTextOnTail

    withoutTrailText.curatedPlusBackfillDeduplicated shouldBe
      pressedCollection.curatedPlusBackfillDeduplicated.head :: pressedCollection.curatedPlusBackfillDeduplicated.tail
        .map(_.withoutTrailText)
  }

  "withoutTrailTextOnTail" should "execute on empty curated and backfill" in {
    val pressedCollection = PressedCollectionBuilder.mkPressedCollection(curated = Nil, backfill = Nil)
    val withoutTrailText = pressedCollection.withoutTrailTextOnTail

    withoutTrailText.curatedPlusBackfillDeduplicated shouldBe pressedCollection.curatedPlusBackfillDeduplicated
  }
}
