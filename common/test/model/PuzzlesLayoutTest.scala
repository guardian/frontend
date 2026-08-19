package model.dotcomrendering

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.{JsError, Json}

class PuzzlesLayoutTest extends AnyFlatSpec with Matchers {

  private val representativeLayoutJson = Json.parse(
    """
      |{
      |  "filters": [{"id":"logic","title":"Logic","backgroundColour":"#CDECFB"}],
      |  "containers": [{
      |    "title":"Logic puzzles",
      |    "variant":"standard",
      |    "filterId":"logic",
      |    "content": {
      |      "items": [[{
      |        "title":"Sudoku",
      |        "type":"sudoku",
      |        "set":"easy",
      |        "url":"https://example.com/sudoku",
      |        "image":"https://example.com/sudoku.png",
      |        "slug":"sudoku-easy",
      |        "index":1,
      |        "variant":"iframe-page",
      |        "backgroundColour":"#CDECFB",
      |        "filterId":"logic"
      |      }]],
      |      "nestedContainers": [{
      |        "title":"More logic",
      |        "desktopSpan":6,
      |        "content": {
      |          "items":[[{
      |            "title":"Futoshiki",
      |            "type":"futoshiki",
      |            "set":"all"
      |          }]],
      |          "nestedContainers":[],
      |          "archive": {
      |            "title":"Archive",
      |            "type":"futoshiki",
      |            "set":"all",
      |            "slug":"futoshiki",
      |            "url":"https://example.com/futoshiki/archive",
      |            "variant":"archive-page"
      |          }
      |        }
      |      }]
      |    }
      |  }]
      |}
      |""".stripMargin,
  )

  "PuzzlesLayout JSON format" should "parse grouped items, nested containers, archive entries and responsive fields" in {
    val layout = representativeLayoutJson.as[PuzzlesLayout]
    val container = layout.containers.head
    val item = container.content.items.head.head
    val nested = container.content.nestedContainers.head

    layout.filters.head.backgroundColour shouldBe Some("#CDECFB")
    container.variant shouldBe Some("standard")
    item.slug shouldBe Some("sudoku-easy")
    item.index shouldBe Some(1)
    item.image shouldBe Some("https://example.com/sudoku.png")
    nested.desktopSpan shouldBe Some(6)
    nested.content.archive.map(_.variant) shouldBe Some(Some("archive-page"))
  }

  it should "preserve the DCR payload shape when serializing" in {
    val layout = representativeLayoutJson.as[PuzzlesLayout]

    Json.toJson(layout) shouldBe representativeLayoutJson
  }

  it should "omit absent optional item, container, archive and filter fields" in {
    val layout = PuzzlesLayout(
      containers = Seq(
        PuzzleContainer(
          title = "Crosswords",
          content = PuzzleContent(
            items = Seq(Seq(PuzzleItem("Quick", "crossword", "quick"))),
            nestedContainers = Seq.empty,
          ),
        ),
      ),
      filters = Seq(PuzzleFilter("crosswords", "Crosswords")),
    )

    Json.toJson(layout) shouldBe Json.parse(
      """{
        |  "containers":[{
        |    "title":"Crosswords",
        |    "content":{
        |      "items":[[{"title":"Quick","type":"crossword","set":"quick"}]],
        |      "nestedContainers":[]
        |    }
        |  }],
        |  "filters":[{"id":"crosswords","title":"Crosswords"}]
        |}""".stripMargin,
    )
  }

  it should "reject a partially valid contract" in {
    val result = Json
      .parse(
        """{"containers":[{"title":"Broken","content":{"items":[[{"title":"Missing fields"}]],"nestedContainers":[]}}]}""",
      )
      .validate[PuzzlesLayout]

    result shouldBe a[JsError]
  }
}
