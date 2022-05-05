package common.commercial

import common.facia.PressedCollectionBuilder.mkPressedCollection
import common.editions.Uk
import model.facia.PressedCollection
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.OptionValues

class ContainerModelTest extends AnyFlatSpec with Matchers with OptionValues {

  def fromUkPressedCollection: (PressedCollection) => ContainerModel = {
    ContainerModel.fromPressedCollection(Uk)
  }

  "fromPressedCollection" should "populate id" in {
    val pressedCollection = mkPressedCollection("fixed/small/slow-I")
    val container = fromUkPressedCollection(pressedCollection)
    container.id shouldBe "test-collection-id"
  }

  it should "populate title" in {
    val pressedCollection = mkPressedCollection("fixed/small/slow-I")
    val container = fromUkPressedCollection(pressedCollection)
    container.content.title shouldBe "test-collection-displayName"
  }

  it should "populate description" in {
    val pressedCollection = mkPressedCollection("fixed/small/slow-I")
    val container = fromUkPressedCollection(pressedCollection)
    container.content.description.value shouldBe "desc"
  }

  it should "populate targetUrl" in {
    val pressedCollection = mkPressedCollection("fixed/small/slow-I")
    val container = fromUkPressedCollection(pressedCollection)
    container.content.targetUrl.value shouldBe
      "/am-resorts-partner-zone/2016/jan/20/be-a-hero-on-the-half-shell-release-baby-turtles-on-your-next-vacation"
  }

  it should "populate layoutName" in {
    val pressedCollection = mkPressedCollection("fixed/small/slow-I")
    val container = fromUkPressedCollection(pressedCollection)
    container.layoutName shouldBe "fixed/small/slow-I"
  }

  it should "populate initial cards in a fixed container" in {
    val pressedCollection = mkPressedCollection("fixed/medium/fast-XII")
    val model = fromUkPressedCollection(pressedCollection)
    model.content.initialCards.size shouldBe 4
  }

  it should "populate show-more cards" in {
    val pressedCollection = mkPressedCollection("fixed/small/slow-I")
    val model = fromUkPressedCollection(pressedCollection)
    model.content.showMoreCards.size shouldBe 4
  }

  it should "leave show-more cards empty if hideShowMore property is set" in {
    val pressedCollection = mkPressedCollection("fixed/small/slow-I", hideShowMore = true)
    val model = fromUkPressedCollection(pressedCollection)
    model.content.showMoreCards shouldBe empty
  }
}
