package common.commercial

import model.facia.PressedCollection
import model.pressed.{CollectionConfig, CuratedContent, PressedContent}
import org.scalatest.{FlatSpec, Matchers}

class PressedCollectionContainerTest extends FlatSpec with Matchers {

  "A PressedCollection" should "be marshalled into a ContainerContent" in {

    val pressedConfig: CollectionConfig = new CollectionConfig(
      displayName = Some("test-collection-displayName"),
      backfill = None,
      collectionType = "fixed/small/slow-III",
      href = Some("/am-resorts-partner-zone/2016/jan/20/be-a-hero-on-the-half-shell-release-baby-turtles-on-your-next-vacation"),
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
      hideShowMore = false
    )

    val pressedCollection: PressedCollection = new PressedCollection(
      id = "test-collection-id",
      displayName = pressedConfig.displayName.get,
      curated = Nil,
      backfill = Nil,
      treats = Nil,
      lastUpdated = None,
      updatedBy = None,
      updatedEmail = None,
      href = pressedConfig.href,
      description = pressedConfig.description,
      collectionType = pressedConfig.collectionType,
      groups = pressedConfig.groups,
      uneditable = pressedConfig.uneditable,
      showTags = pressedConfig.showTags,
      showSections = pressedConfig.showSections,
      hideKickers = pressedConfig.hideKickers,
      showDateHeader = pressedConfig.showDateHeader,
      showLatestUpdate = pressedConfig.showLatestUpdate,
      config = pressedConfig
    )

    val container = ContainerModel.fromPressedCollection(pressedCollection)

    (container.content, pressedCollection) match {
      case (cont, collection) =>
        container.id should be(collection.id)
        cont.title should be(collection.displayName)
        cont.description should be(collection.description)
        cont.targetUrl should be(collection.href)
    }

    (container.metaData, pressedCollection, pressedCollection.config) match {
      case (metaData, collection, config) =>
        metaData.hideShowMore     should be (config.hideShowMore)
        metaData.layoutName       should be (collection.collectionType)
    }
  }

}
