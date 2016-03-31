package common.commercial

import common.commercial.FixtureBuilder._
import model.facia.PressedCollection
import model.pressed.CollectionConfig
import org.scalatest.{FlatSpec, Matchers, OptionValues}

class ContainerModelTest extends FlatSpec with Matchers with OptionValues {

  private def mkPressedCollection(hideShowMore: Boolean = false): PressedCollection = {

    def mkConfig(): CollectionConfig = CollectionConfig(
      displayName = None,
      backfill = None,
      collectionType = "layout2",
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
      curated = List(mkPressedContent(1), mkPressedContent(2), mkPressedContent(3)),
      backfill = List(mkPressedContent(4), mkPressedContent(5)),
      treats = Nil,
      lastUpdated = None,
      updatedBy = None,
      updatedEmail = None,
      href = Some(
        "/am-resorts-partner-zone/2016/jan/20/be-a-hero-on-the-half-shell-release-baby-turtles-on-your-next-vacation"
      ),
      description = Some("desc"),
      collectionType = "fixed/small/slow-I",
      groups = None,
      uneditable = false,
      showTags = false,
      showSections = false,
      hideKickers = false,
      showDateHeader = false,
      showLatestUpdate = false,
      config = mkConfig()
    )
  }

  "fromPressedCollection" should "populate id" in {
    val pressedCollection = mkPressedCollection()
    val container = ContainerModel.fromPressedCollection(pressedCollection)
    container.id shouldBe "test-collection-id"
  }

  it should "populate title" in {
    val pressedCollection = mkPressedCollection()
    val container = ContainerModel.fromPressedCollection(pressedCollection)
    container.content.title shouldBe "test-collection-displayName"
  }

  it should "populate description" in {
    val pressedCollection = mkPressedCollection()
    val container = ContainerModel.fromPressedCollection(pressedCollection)
    container.content.description.value shouldBe "desc"
  }

  it should "populate targetUrl" in {
    val pressedCollection = mkPressedCollection()
    val container = ContainerModel.fromPressedCollection(pressedCollection)
    container.content.targetUrl.value shouldBe
      "/am-resorts-partner-zone/2016/jan/20/be-a-hero-on-the-half-shell-release-baby-turtles-on-your-next-vacation"
  }

  it should "populate layoutName" in {
    val pressedCollection = mkPressedCollection()
    val container = ContainerModel.fromPressedCollection(pressedCollection)
    container.layoutName shouldBe "fixed/small/slow-I"
  }

  it should "populate show-more cards" in {
    val pressedCollection = mkPressedCollection()
    val model = ContainerModel.fromPressedCollection(pressedCollection)
    model.content.showMoreCards.size shouldBe 4
  }

  it should "leave show-more cards empty if hideShowMore property is set" in {
    val pressedCollection = mkPressedCollection(hideShowMore = true)
    val model = ContainerModel.fromPressedCollection(pressedCollection)
    model.content.showMoreCards shouldBe empty
  }
}
