package model.dotcomrendering

import com.gu.commercial.branding.{Dimensions, Logo}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.{JsError, JsObject, JsSuccess, Json}

class PuzzlesLayoutTest extends AnyFlatSpec with Matchers {

  private val representativeLayoutJson = Json.parse(
    """
      |{
      |  "containers": [{
      |    "id":"logic-puzzles",
      |    "title":"Logic puzzles",
      |    "variant":"standard",
      |    "content": {
      |      "items": [[{
      |        "id":"sudoku-easy",
      |        "title":"Sudoku",
      |        "type":"sudoku",
      |        "set":"easy",
      |        "cardVariant":"primary",
      |        "cadence":"Daily",
      |        "url":"https://example.com/sudoku",
      |        "image":"https://example.com/sudoku.png",
      |        "imageAlt":"Easy sudoku illustration",
      |        "slug":"sudoku-easy",
      |        "index":1,
      |        "variant":"iframe-page",
      |        "backgroundColour":"#CDECFB"
      |      }]],
      |      "nestedContainers": [{
      |        "id":"more-logic",
      |        "title":"More logic",
      |        "desktopSpan":6,
      |        "content": {
      |          "items":[[{
      |            "id":"futoshiki-daily",
      |            "title":"Futoshiki",
      |            "type":"futoshiki",
      |            "set":"all",
      |            "cardVariant":"compact",
      |            "cadence":"Daily"
      |          }]],
      |          "nestedContainers":[],
      |          "archive": {
      |            "id":"futoshiki-archive",
      |            "title":"Archive",
      |            "type":"futoshiki",
      |            "set":"all",
      |            "cardVariant":"archive",
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
    item.imageAlt shouldBe Some("Easy sudoku illustration")
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
        |  "containers":[{
        |    "id":"crosswords",
        |    "title":"Crosswords",
        |    "content":{
        |      "items":[[{
        |        "id":"crossword-quick",
        |        "title":"Quick",
        |        "type":"crossword",
        |        "set":"quick",
        |        "cardVariant":"primary",
        |        "cadence":"Daily"
        |      }]],
        |      "nestedContainers":[]
        |    }
        |  }]
        |}""".stripMargin,
    )
  }

  it should "round-trip crossword setter names and artwork descriptions" in {
    val item = PuzzleItem(
      "crossword-quick",
      "Quick",
      "crossword",
      "quick",
      "primary",
      cadence = Some("Daily"),
      imageAlt = Some("Quick crossword illustration"),
      setter = Some("Example setter"),
      date = Some("2026-09-16"),
    )
    Json.toJson(item).as[PuzzleItem] shouldBe item
    (Json.toJson(item) \ "setter").as[String] shouldBe "Example setter"
    (Json.toJson(item) \ "date").as[String] shouldBe "2026-09-16"
    Seq("imageAlt", "setter", "date").foreach { field =>
      val invalid = Json.toJson(item).as[play.api.libs.json.JsObject] ++ Json.obj(field -> 123)
      invalid.validate[PuzzleItem] shouldBe a[JsError]
    }
  }

  it should "reject unsupported card variants" in {
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

  it should "accept a non-archive puzzle without a static cadence" in {
    val item = PuzzleItem("crossword-quick", "Quick", "crossword", "quick", "primary")

    Json.toJson(item).validate[PuzzleItem] shouldBe JsSuccess(item)
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
        |  "containers":[{
        |    "id":"crosswords",
        |    "title":"Crosswords",
        |    "desktopSpan":13,
        |    "content":{"items":[],"nestedContainers":[]}
        |  }]
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

  it should "support ad placements and archive choices" in {
    val archive = PuzzleItem(
      "archive-one",
      "Archive one",
      "word-game",
      "all",
      "archive",
      url = Some("/puzzles-and-games/one"),
    )
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

  it should "support a single archive choice" in {
    val archive = PuzzleItem(
      "archive-word-games",
      "Word games",
      "word-game",
      "all",
      "archive",
      url = Some("/puzzles-and-games/word-games/archive"),
    )
    val layout = PuzzlesLayout(
      Seq(
        PuzzleContainer(
          id = "word-games",
          title = "Word games",
          content = PuzzleContent(Seq.empty, Seq.empty, archiveChoices = Some(Seq(archive))),
        ),
      ),
    )

    PuzzlesLayout.validationErrors(layout) shouldBe empty
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

  private def withSponsorship(sponsorship: String) =
    representativeLayoutJson.as[JsObject] + ("sponsorship" -> Json.parse(sponsorship))

  private val auSponsorship =
    """{
      |  "AU": {
      |    "name": "Example sponsor",
      |    "label": "Supported by",
      |    "accessibilityLabel": "This content is sponsored by Example sponsor",
      |    "sponsorUri": "https://example.com",
      |    "aboutUri": "https://example.com/about",
      |    "logo": { "src": "https://example.com/logo.png", "darkSrc": "https://example.com/logo-dark.png", "aspectRatio": 2.5, "baseline": 0.8 },
      |    "layout": { "labelPosition": "leading", "labelAlignment": "center", "verticalPlacement": "center", "logoHeight": 32, "gap": 8 }
      |  }
      |}""".stripMargin

  it should "read hub sponsorship per edition, ignoring app-only fields, and keep it out of the DCR layout" in {
    val layout = withSponsorship(auSponsorship).as[PuzzlesLayout]

    layout.sponsorship.keySet shouldBe Set("AU")
    Json.toJson(layout) shouldBe representativeLayoutJson
  }

  it should "map a sponsor to per-edition sponsored branding" in {
    val branding = withSponsorship(auSponsorship).as[PuzzlesLayout].commercialProperties("AU").branding.get

    branding.isSponsored shouldBe true
    branding.sponsorName shouldBe "Example sponsor"
    branding.aboutThisLink shouldBe "https://example.com/about"
    branding.logo shouldBe Logo(
      "https://example.com/logo.png",
      Some(Dimensions(250, 100)),
      "https://example.com",
      "Supported by",
    )
    branding.logoForDarkBackground.map(_.src) shouldBe Some("https://example.com/logo-dark.png")
  }

  it should "default a missing about link to empty and have no sponsorship when the block is absent" in {
    val withoutAbout = withSponsorship(auSponsorship.replace(""""aboutUri": "https://example.com/about",""", ""))

    withoutAbout.as[PuzzlesLayout].commercialProperties("AU").branding.map(_.aboutThisLink) shouldBe Some("")
    representativeLayoutJson.as[PuzzlesLayout].commercialProperties shouldBe empty
  }

  it should "reject sponsorship for an unknown edition or with an invalid URL" in {
    withSponsorship(auSponsorship.replace(""""AU"""", """"XX"""")).validate[PuzzlesLayout] shouldBe a[JsError]
    withSponsorship(auSponsorship.replace("https://example.com/logo.png", "javascript:alert(1)"))
      .validate[PuzzlesLayout] shouldBe a[JsError]
  }

  private def withGameSponsorship(sponsorship: String, group: String = "word-games") =
    representativeLayoutJson.as[JsObject] + ("gameSponsorship" -> Json.obj(group -> Json.parse(sponsorship)))

  it should "read game sponsorship without sending the configuration to DCR" in {
    val layout = withGameSponsorship(auSponsorship).as[PuzzlesLayout]

    layout.gameSponsorship.keySet shouldBe Set("word-games")
    Json.toJson(layout) shouldBe representativeLayoutJson
  }

  it should "not activate game sponsorship from a hub sponsor alone" in {
    val layout = withSponsorship(auSponsorship).as[PuzzlesLayout]

    layout.gameCommercialProperties("word-games") shouldBe empty
  }

  it should "use the game sponsor when no hub sponsor is configured" in {
    val layout = withGameSponsorship(auSponsorship).as[PuzzlesLayout]

    layout.gameCommercialProperties("word-games")("AU").branding.map(_.sponsorName) shouldBe Some("Example sponsor")
    layout.gameCommercialProperties("word-games").keySet shouldBe Set("AU")
    layout.gameCommercialProperties("logic-puzzles") shouldBe empty
  }

  it should "prefer the hub sponsor only for editions with explicit game sponsorship" in {
    val gameLayout = withGameSponsorship(auSponsorship).as[PuzzlesLayout]
    val gameSponsor = gameLayout.gameSponsorship("word-games")("AU")
    val layout = gameLayout.copy(sponsorship =
      Map(
        "AU" -> gameSponsor.copy(name = "Hub sponsor"),
        "UK" -> gameSponsor.copy(name = "UK hub sponsor"),
      ),
    )

    layout.gameCommercialProperties("word-games")("AU").branding.map(_.sponsorName) shouldBe Some("Hub sponsor")
    layout.gameCommercialProperties("word-games").keySet shouldBe Set("AU")
    layout.gameCommercialProperties("logic-puzzles") shouldBe empty
  }

  it should "not override a game sponsor with a hub sponsor for a different edition" in {
    val gameLayout = withGameSponsorship(auSponsorship).as[PuzzlesLayout]
    val layout = gameLayout.copy(sponsorship =
      Map(
        "UK" -> gameLayout.gameSponsorship("word-games")("AU").copy(name = "UK hub sponsor"),
      ),
    )

    layout.gameCommercialProperties("word-games")("AU").branding.map(_.sponsorName) shouldBe Some("Example sponsor")
    layout.gameCommercialProperties("word-games").keySet shouldBe Set("AU")
  }

  it should "reject game sponsorship with an unknown group, edition or invalid URL" in {
    withGameSponsorship(auSponsorship, "unknown-game").validate[PuzzlesLayout] shouldBe a[JsError]
    withGameSponsorship(auSponsorship, "crosswords").validate[PuzzlesLayout] shouldBe a[JsError]
    withGameSponsorship(auSponsorship, "trivia-and-quizzes").validate[PuzzlesLayout] shouldBe a[JsError]
    withGameSponsorship(auSponsorship.replace("\"AU\"", "\"XX\"")).validate[PuzzlesLayout] shouldBe a[JsError]
    withGameSponsorship(auSponsorship.replace("https://example.com/logo.png", "javascript:alert(1)"))
      .validate[PuzzlesLayout] shouldBe a[JsError]
  }
}
