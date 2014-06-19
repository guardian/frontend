package config

import frontsapi.model.{Front, Collection, Config}
import org.scalatest._
import controllers.CreateFront

class TransformationsSpec extends FlatSpec with ShouldMatchers {
  val collectionFixture = Collection(
    displayName = Some("New collection"),
    apiQuery = Some("backfill"),
    `type` = Some("???"),
    href = Some("newfront"),
    groups = Some(List("1", "2")),
    uneditable = Some(false),
    showTags = Some(true),
    showSections = Some(false)
  )

  val createCommandFixture = CreateFront(
    "new front id",
    navSection = Some("uk"),
    webTitle = Some("New Front!"),
    title = Some("New front"),
    description = Some("A test front"),
    priority = Some("high"),
    initialCollection = collectionFixture
  )

  val emptyCollectionFixture = Collection(
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None
  )

  val emptyFrontFixture = Front(Nil, None, None, None, None, None)

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
}
