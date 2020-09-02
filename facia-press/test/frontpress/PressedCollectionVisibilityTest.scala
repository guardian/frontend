package frontpress

import helpers.FaciaTestData
import model.facia.PressedCollection
import org.scalatest.{FlatSpec, Matchers}
import com.gu.facia.client.models.{AnyPlatform, AppCollection, CollectionPlatform, WebCollection}

class PressedCollectionVisibilityTest extends FlatSpec with Matchers with FaciaTestData {

  trait PressedCollectionVisibilityScope {
    val collections: List[PressedCollection] = ukFaciaPage.collections.map { collection =>
      collection.copy(curated = collection.curated.take(5))
    }
    val pressedCollection: PressedCollection = collections.head
  }

  it should "identify web collections" in new PressedCollectionVisibilityScope {
    def withPlatform(platform: CollectionPlatform): PressedCollectionVisibility =
      PressedCollectionVisibility(
        pressedCollection = pressedCollection.copy(config = pressedCollection.config.copy(platform = Some(platform))),
        3,
      )
    PressedCollectionVisibility.isWebCollection(withPlatform(AppCollection)) should be(false)
    PressedCollectionVisibility.isWebCollection(withPlatform(WebCollection)) should be(true)
    PressedCollectionVisibility.isWebCollection(withPlatform(AnyPlatform)) should be(true)
  }
}
