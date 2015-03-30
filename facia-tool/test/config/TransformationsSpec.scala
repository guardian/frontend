package config

import com.gu.facia.client.models.{ConfigJson => Config, FrontJson => Front, CollectionConfigJson => CollectionConfig}
import org.scalatest._
import controllers.CreateFront
import test.ConfiguredTestSuite

@DoNotDiscover class TransformationsSpec extends FlatSpec with ShouldMatchers with ConfiguredTestSuite {
  val collectionFixture = CollectionConfig.withDefaults(
    displayName = Some("New collection"),
    apiQuery = Some("backfill"),
    `type` = Some("???"),
    href = Some("newfront"),
    groups = Some(List("1", "2")),
    uneditable = Some(false),
    showTags = Some(true),
    showSections = Some(false),
    hideKickers = Some(false),
    showLatestUpdate = Some(false),
    showDateHeader = Some(false)
  )

  val createCommandFixture = CreateFront(
    "new front id",
    navSection = Some("uk"),
    webTitle = Some("New Front!"),
    title = Some("New front"),
    description = Some("A test front"),
    onPageDescription = Some("A test front"),
    imageUrl = None,
    imageWidth = None,
    imageHeight = None,
    isImageDisplayed = None,
    isHidden = None,
    priority = Some("high"),
    initialCollection = collectionFixture
  )

  val emptyCollectionFixture = CollectionConfig(
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None
  )

  val emptyFrontFixture = Front(Nil, None, None, None, None, None, None, None, None, None, None, None)

  val validConfigFixture = Config.empty.copy(
    fronts = Map("foo" -> emptyFrontFixture.copy(collections = List("bar"))),
    collections = Map("bar" -> emptyCollectionFixture)
  )

  "createFront" should "add the collection to the config with the given id" in {
    Transformations.createFront(createCommandFixture, "new collection id")(Config.empty)
      .collections.get("new collection id") shouldEqual Some(collectionFixture)
  }

  it should "add the front to the config with the given front id" in {
    Transformations.createFront(createCommandFixture, "new collection id")(Config.empty)
      .fronts.get("new front id") shouldEqual Some(Front(
        collections = List("new collection id"),
        navSection = Some("uk"),
        webTitle = Some("New Front!"),
        title = Some("New front"),
        description = Some("A test front"),
        onPageDescription = Some("A test front"),
        imageUrl = None,
        imageWidth = None,
        imageHeight = None,
        isImageDisplayed = None,
        isHidden = None,
        priority = Some("high")
      ))
  }

  "prune" should "remove collections that are not referred to by any fronts" in {
    Transformations.prune(
      Config.empty.copy(
        collections = Map(
          "bar" -> emptyCollectionFixture
        )
      )
    ) shouldEqual Config.empty
  }

  it should "not remove collections that are referred to by a front" in {
    Transformations.prune(validConfigFixture).collections should have size 1
  }

  it should "remove fronts that do not contain any collections" in {
    Transformations.prune(
      Config.empty.copy(fronts = Map("foo" -> emptyFrontFixture))
    ) shouldEqual Config.empty
  }

  it should "not remove fronts that contain collections" in {
    Transformations.prune(validConfigFixture).fronts should have size 1
  }

  "updateCollection" should "add the collection's ID to specified fronts that do not contain it" in {
    val frontIds = List("one", "two", "three")

    val updatedConfig = Transformations.updateCollection(frontIds, "foo", emptyCollectionFixture)(Config.empty.copy(
      fronts = frontIds.map(_ -> emptyFrontFixture).toMap
    ))

    val expectedFront = emptyFrontFixture.copy(collections = List("foo"))

    for (frontId <- frontIds) {
      updatedConfig.fronts.get(frontId) shouldEqual Some(expectedFront)
    }
  }

  it should "append to the end of the list of collection IDs" in {
    val updatedConfig = Transformations.updateCollection(List("bar"), "foo", emptyCollectionFixture)(Config.empty.copy(
      fronts = Map("bar" -> emptyFrontFixture.copy(collections = List("one", "two"))),
      collections = Map(
        "one" -> emptyCollectionFixture,
        "two" -> emptyCollectionFixture
      )
    ))

    updatedConfig.fronts.get("bar").map(_.collections) shouldEqual Some(List(
      "one",
      "two",
      "foo"
    ))
  }

  it should "not modify fronts that already contain the id" in {
    val frontIds = List("one", "two", "three")

    val frontWithCollection = emptyFrontFixture.copy(collections = List("foo"))

    val initialConfig = Config.empty.copy(
      fronts = frontIds.map(_ -> frontWithCollection).toMap
    )

    val updatedConfig = Transformations.updateCollection(frontIds, "foo", emptyCollectionFixture)(initialConfig)

    updatedConfig.fronts shouldEqual initialConfig.fronts
  }
}
