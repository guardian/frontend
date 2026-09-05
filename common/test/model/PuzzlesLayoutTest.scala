package model.dotcomrendering

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.{JsError, Json}

class PuzzlesLayoutTest extends AnyFlatSpec with Matchers {

  private val representativeLayoutJson = Json.parse(
    """
 |{
 | "filters": [{
 | "id":"logic",
 | "title":"Logic",
 | "target":"#logic-puzzles",
 | "backgroundColour":"#CDECFB"
 | }],
 | "containers": [{
 | "id":"logic-puzzles",
 | "title":"Logic puzzles",
 | "variant":"standard",
 | "filterId":"logic",
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
 | "backgroundColour":"#CDECFB",
 | "filterId":"logic"
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

  "PuzzlesLayout JSON format" should "parse presentation metadata, grouped rows, navigation and archives" in {
    val layout = representativeLayoutJson.as[PuzzlesLayout]
    val container = layout.containers.head
    val item = container.content.items.head.head
    val nested = container.content.nestedContainers.head

    layout.filters.head.target shouldBe "#logic-puzzles"
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

  it should "omit absent optional item, container, archive and navigation fields" in {
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
      filters = Seq(PuzzleFilter("crosswords", "Crosswords", "#crosswords")),
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
 | }],
 | "filters":[{"id":"crosswords","title":"Crosswords","target":"#crosswords"}]
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

  it should "reject duplicate puzzle IDs, broken navigation anchors and unknown filter references" in {
    val duplicate = PuzzleItem("duplicate", "One", "quiz", "one", "primary", Some("Daily"))
    val layout = PuzzlesLayout(
      containers = Seq(
        PuzzleContainer(
          id = "section",
          title = "Section",
          content = PuzzleContent(Seq(Seq(duplicate, duplicate.copy(title = "Two"))), Seq.empty),
          filterId = Some("missing-filter"),
        ),
      ),
      filters = Seq(PuzzleFilter("navigation", "Navigation", "#missing-section")),
    )

    val errors = PuzzlesLayout.validationErrors(layout)

    errors should contain("duplicate puzzle id 'duplicate'")
    errors should contain("navigation target '#missing-section' has no container")
    errors should contain("filterId 'missing-filter' is not defined")
    Json.toJson(layout).validate[PuzzlesLayout] shouldBe a[JsError]
  }

  it should "reject unsupported desktop spans and navigation targets" in {
    val json = Json.parse(
      """{
 | "filters":[{"id":"crosswords","title":"Crosswords","target":"/crosswords"}],
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
}
