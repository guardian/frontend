package model.dotcomrendering

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.{JsError, Json}

class PuzzlesLayoutTest extends AnyFlatSpec with Matchers {

  private val representativeLayoutJson = Json.parse(
    """
 |{
 | "containers": [{
 | "id":"logic-puzzles",
 | "title":"Logic puzzles",
 | "variant":"standard",
 | "content": {
 | "items": [[{
 | "id":"sudoku-easy",
 | "title":"Sudoku",
 | "type":"sudoku",
 | "set":"easy",
 | "cardVariant":"primary",
 | "cadence":"Daily",
 | "url":"https://example.com/sudoku",
 | "image":"https://example.com/sudoku.png",
 | "slug":"sudoku-easy",
 | "index":1,
 | "variant":"iframe-page",
 | "backgroundColour":"#CDECFB"
 | }]],
 | "nestedContainers": [{
 | "id":"more-logic",
 | "title":"More logic",
 | "desktopSpan":6,
 | "content": {
 | "items":[[{
 | "id":"futoshiki-daily",
 | "title":"Futoshiki",
 | "type":"futoshiki",
 | "set":"all",
 | "cardVariant":"compact",
 | "cadence":"Daily"
 | }]],
 | "nestedContainers":[],
 | "archive": {
 | "id":"futoshiki-archive",
 | "title":"Archive",
 | "type":"futoshiki",
 | "set":"all",
 | "cardVariant":"archive",
 | "slug":"futoshiki",
 | "url":"https://example.com/futoshiki/archive",
 | "variant":"archive-page"
 | }
 | }
 | }]
 | }
 | }]
 |}
 |""".stripMargin,
  )

  "PuzzlesLayout JSON format" should "parse presentation metadata, grouped rows and archives" in {
    val layout = representativeLayoutJson.as[PuzzlesLayout]
    val container = layout.containers.head
    val item = container.content.items.head.head
    val nested = container.content.nestedContainers.head

    container.id shouldBe "logic-puzzles"
    container.variant shouldBe Some("standard")
    item.id shouldBe "sudoku-easy"
    item.cardVariant shouldBe "primary"
    item.cadence shouldBe Some("Daily")
    item.image shouldBe Some("https://example.com/sudoku.png")
    nested.desktopSpan shouldBe Some(6)
    nested.content.archive.map(_.cardVariant) shouldBe Some("archive")
  }

  it should "preserve the DCR payload shape when serializing" in {
    val layout = representativeLayoutJson.as[PuzzlesLayout]

    Json.toJson(layout) shouldBe representativeLayoutJson
  }

  it should "omit absent optional item, container and archive fields" in {
    val layout = PuzzlesLayout(
      containers = Seq(
        PuzzleContainer(
          id = "crosswords",
          title = "Crosswords",
          content = PuzzleContent(
            items = Seq(
              Seq(PuzzleItem("crossword-quick", "Quick", "crossword", "quick", "primary", Some("Daily"))),
            ),
            nestedContainers = Seq.empty,
          ),
        ),
      ),
    )

    Json.toJson(layout) shouldBe Json.parse(
      """{
 | "containers":[{
 | "id":"crosswords",
 | "title":"Crosswords",
 | "content":{
 | "items":[[{
 | "id":"crossword-quick",
 | "title":"Quick",
 | "type":"crossword",
 | "set":"quick",
 | "cardVariant":"primary",
 | "cadence":"Daily"
 | }]],
 | "nestedContainers":[]
 | }
 | }]
 |}""".stripMargin,
    )
  }

  it should "reject unsupported card variants and missing cadence" in {
    val invalidVariant = representativeLayoutJson.as[play.api.libs.json.JsObject] ++ Json.obj(
      "containers" -> Json.arr(
        Json.obj(
          "id" -> "broken",
          "title" -> "Broken",
          "content" -> Json.obj(
            "items" -> Json.arr(
              Json.arr(
                Json.obj(
                  "id" -> "broken-item",
                  "title" -> "Broken",
                  "type" -> "quiz",
                  "set" -> "all",
                  "cardVariant" -> "hero",
                ),
              ),
            ),
            "nestedContainers" -> Json.arr(),
          ),
        ),
      ),
    )

    invalidVariant.validate[PuzzlesLayout] shouldBe a[JsError]
  }

  it should "reject duplicate puzzle IDs" in {
    val duplicate = PuzzleItem("duplicate", "One", "quiz", "one", "primary", Some("Daily"))
    val layout = PuzzlesLayout(
      containers = Seq(
        PuzzleContainer(
          id = "section",
          title = "Section",
          content = PuzzleContent(Seq(Seq(duplicate, duplicate.copy(title = "Two"))), Seq.empty),
        ),
      ),
    )

    val errors = PuzzlesLayout.validationErrors(layout)

    errors should contain("duplicate puzzle id 'duplicate'")
    Json.toJson(layout).validate[PuzzlesLayout] shouldBe a[JsError]
  }

  it should "reject unsupported desktop spans" in {
    val json = Json.parse(
      """{
 | "containers":[{
 | "id":"crosswords",
 | "title":"Crosswords",
 | "desktopSpan":13,
 | "content":{"items":[],"nestedContainers":[]}
 | }]
 |}""".stripMargin,
    )

    json.validate[PuzzlesLayout] shouldBe a[JsError]
  }

  it should "reject a partially valid contract" in {
    val result = Json
      .parse(
        """{"containers":[{"id":"broken","title":"Broken","content":{"items":[[{"title":"Missing fields"}]],"nestedContainers":[]}}]}""",
      )
      .validate[PuzzlesLayout]

    result shouldBe a[JsError]
  }

  it should "support ad placements and multiple archive choices" in {
    val archive = PuzzleItem("archive-one", "Archive one", "word-game", "all", "archive", url = Some("/puzzles/one"))
    val section = PuzzleContainer(
      id = "word-games",
      title = "Word games",
      content = PuzzleContent(
        items = Seq(Seq(PuzzleItem("word-game", "Word game", "word-game", "all", "primary", Some("Daily")))),
        nestedContainers = Seq.empty,
        archiveChoices = Some(Seq(archive, archive.copy(id = "archive-two", title = "Archive two"))),
      ),
    )
    val advert = PuzzleContainer(
      id = "inline-ad",
      title = "",
      variant = Some("ad"),
      content = PuzzleContent(Seq.empty, Seq.empty),
      adSlot = Some("inline1"),
    )
    val layout = PuzzlesLayout(Seq(section, advert))

    PuzzlesLayout.validationErrors(layout) shouldBe empty
    ((Json.toJson(layout) \ "containers")(1) \ "adSlot").as[String] shouldBe "inline1"
  }

  it should "reject malformed ad and archive composition" in {
    val malformedAd = PuzzleContainer(
      id = "ad",
      title = "Not empty",
      variant = Some("ad"),
      content = PuzzleContent(Seq.empty, Seq.empty),
      adSlot = Some("bad-slot"),
    )
    val layout = PuzzlesLayout(Seq(malformedAd))

    Json.toJson(layout).validate[PuzzlesLayout] shouldBe a[JsError]
  }
}
