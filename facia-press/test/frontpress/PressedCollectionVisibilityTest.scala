package frontpress

import helpers.FaciaTestData
import model.PressedCollectionVersions
import model.facia.PressedCollection
import org.scalatest.{FlatSpec, Matchers}
import com.gu.facia.client.models.{CollectionPlatform, AppCollection, WebCollection, AnyPlatform}

class PressedCollectionVisibilityTest extends FlatSpec with Matchers with FaciaTestData {

  trait PressedCollectionVisibilityScope {
    val collections: List[PressedCollection] = ukFaciaPage.collections.map { collection =>
      collection.copy(curated = collection.curated.take(5))
    }
    val pressedCollection: PressedCollection = collections.head
  }

  "deduplication" should "not remove duplicated curated content" in new PressedCollectionVisibilityScope {
    val collectionVisibility: PressedCollectionVisibility = PressedCollectionVisibility(pressedCollection, 5)
    val collectionWithCurationDuplication: Seq[PressedCollectionVisibility] = collectionVisibility :: collectionVisibility :: Nil

    val collectionWithCurationDuplicationAfterDeduplication = PressedCollectionDeduplication.deduplication(collectionWithCurationDuplication)
    collectionWithCurationDuplicationAfterDeduplication.head shouldBe collectionVisibility
    collectionWithCurationDuplicationAfterDeduplication(1) shouldBe collectionVisibility
  }

  it should "remove duplicated backfill'ed content" in new PressedCollectionVisibilityScope {
    val collectionVisibility: PressedCollectionVisibility = PressedCollectionVisibility(pressedCollection, 3)
    val collectionWithBackfillDuplication: Seq[PressedCollectionVisibility] = collectionVisibility :: collectionVisibility :: Nil
    val collectionWithoutBackfillDuplication = collectionVisibility :: collectionVisibility.copy(pressedCollection = pressedCollection.copy(backfill = Nil)) :: Nil

    val collectionWithBackfillDuplicationAfterDeduplication = PressedCollectionDeduplication.deduplication(collectionWithBackfillDuplication)
    collectionWithBackfillDuplicationAfterDeduplication.head shouldBe collectionVisibility
    collectionWithBackfillDuplicationAfterDeduplication(1) shouldBe collectionWithoutBackfillDuplication(1)
  }

  "pressedCollectionVersions" should "create lite and full versions with hasMore set" in new PressedCollectionVisibilityScope {
    val collectionVisibility: PressedCollectionVisibility = PressedCollectionVisibility(pressedCollection.copy(hasMore = false), 3)
    val liteCollection = pressedCollection.copy(curated = pressedCollection.curated.take(3), hasMore = true)
    val fullCollection = pressedCollection.copy(hasMore = true)
    collectionVisibility.pressedCollectionVersions shouldBe PressedCollectionVersions(liteCollection, fullCollection, liteCollection, fullCollection)
  }

  it should "identify web collections" in new PressedCollectionVisibilityScope {
    def withPlatform(platform: CollectionPlatform): PressedCollectionVisibility = PressedCollectionVisibility(
      pressedCollection = pressedCollection.copy(config = pressedCollection.config.copy(platform = Some(platform))),
      3
    )

    PressedCollectionVisibility.isWebCollection(withPlatform(AppCollection)) should be(false)
    PressedCollectionVisibility.isWebCollection(withPlatform(WebCollection)) should be(true)
    PressedCollectionVisibility.isWebCollection(withPlatform(AnyPlatform)) should be(true)
  }
}
