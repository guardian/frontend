package common.commercial

import common.commercial.FixtureBuilder._
import common.editions.Uk
import model.facia.PressedCollection
import model.pressed.{CollectionConfig, PressedContent}
import org.scalatest.{FlatSpec, Matchers, OptionValues}

class ContainerModelTest extends FlatSpec with Matchers with OptionValues {

  private val defaultCurated = List(mkPressedContent(1), mkPressedContent(2), mkPressedContent(3))
  private val defaultBackfill = List(mkPressedContent(4), mkPressedContent(5))

  private def mkPressedCollection(collectionType: String,
                                  curated: List[PressedContent] = defaultCurated,
                                  backfill: List[PressedContent] = defaultBackfill,
                                  hideShowMore: Boolean = false): PressedCollection = {

    val config: CollectionConfig = CollectionConfig(
      displayName = None,
      backfill = None,
      collectionType = "",
      href = None,
      description = None,
      groups = None,
      uneditable = false,
      showTags = false,
      showSections = false,
      hideKickers = false,
      showDateHeader = false,
      showLatestUpdate = false,
      excludeFromRss = false,
      showTimestamps = false,
      hideShowMore
    )

    PressedCollection(
      id = "test-collection-id",
      displayName = "test-collection-displayName",
      curated,
      backfill,
      treats = Nil,
      lastUpdated = None,
      updatedBy = None,
      updatedEmail = None,
      href = Some(
        "/am-resorts-partner-zone/2016/jan/20/be-a-hero-on-the-half-shell-release-baby-turtles-on-your-next-vacation"
      ),
      description = Some("desc"),
      collectionType,
      groups = None,
      uneditable = false,
      showTags = false,
      showSections = false,
      hideKickers = false,
      showDateHeader = false,
      showLatestUpdate = false,
      config
    )
  }

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
