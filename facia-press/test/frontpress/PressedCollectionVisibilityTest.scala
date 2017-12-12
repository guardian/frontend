package frontpress

import helpers.FaciaTestData
import model.PressedCollectionVersions
import model.facia.PressedCollection
import org.scalatest.{FlatSpec, Matchers}

class PressedCollectionVisibilityTest extends FlatSpec with Matchers with FaciaTestData {

  trait PressedCollectionVisibilityScope {
    val collections: List[PressedCollection] = ukFaciaPage.collections.map { collection =>
      collection.copy(curated = collection.curated.take(5))
    }
    val pressedCollection: PressedCollection = collections.head
  }

  "deduplication" should "remove duplicated curated content" in new PressedCollectionVisibilityScope {
    val collectionVisibility: PressedCollectionVisibility = PressedCollectionVisibility(pressedCollection, 5)

    val duplicatedCollections: Seq[PressedCollectionVisibility] = collectionVisibility :: collectionVisibility :: Nil

    val deduped = PressedCollectionVisibility.deduplication(duplicatedCollections)
    deduped.head shouldBe collectionVisibility

    val collectionWithoutCurated = collectionVisibility.copy(pressedCollection = pressedCollection.copy(curated = Nil))
    deduped(1) shouldBe collectionWithoutCurated
  }

  it should "only remove visible duplicated curated content" in new PressedCollectionVisibilityScope {
    val collectionVisibility: PressedCollectionVisibility = PressedCollectionVisibility(pressedCollection, 3)

    val duplicatedCollections: Seq[PressedCollectionVisibility] = collectionVisibility :: collectionVisibility :: Nil

    val deduped = PressedCollectionVisibility.deduplication(duplicatedCollections)
    deduped.head shouldBe collectionVisibility

    val collectionWithDeduplicatedCurated = collectionVisibility.copy(pressedCollection = pressedCollection.copy(curated = pressedCollection.curated.takeRight(2)))
    deduped(1) shouldBe collectionWithDeduplicatedCurated
  }

  "pressedCollectionVersions" should "create lite and full versions with hasMore set" in new PressedCollectionVisibilityScope {
    val collectionVisibility: PressedCollectionVisibility = PressedCollectionVisibility(pressedCollection.copy(hasMore = false), 3)
    val liteCollection = pressedCollection.copy(curated = pressedCollection.curated.take(3), hasMore = true)
    val fullCollection = pressedCollection.copy(hasMore = true)
    collectionVisibility.pressedCollectionVersions shouldBe PressedCollectionVersions(liteCollection, fullCollection)
  }
}
