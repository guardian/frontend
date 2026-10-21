package model.dotcomrendering

import ab.ABTests
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import staticpages.StaticPages

@DoNotDiscover class DotcomPuzzlesPageRenderingDataModelTest extends AnyFlatSpec with Matchers {

  private val layout = PuzzlesLayout(
    containers = Seq(
      PuzzleContainer(
        id = "daily-puzzles",
        title = "Daily puzzles",
        content = PuzzleContent(
          items = Seq(
            Seq(PuzzleItem("crossword-quick", "Quick crossword", "crossword", "quick", "primary", Some("Daily"))),
          ),
          nestedContainers = Seq.empty,
        ),
      ),
    ),
  )

  private def requestWithParticipations: RequestHeader = {
    implicit val request: RequestHeader = FakeRequest("GET", "/puzzles-and-games")
      .withHeaders(
        "Host" -> "www.theguardian.com",
        "X-GU-Server-AB-Tests" -> "puzzles-new-hub-v1:variant,another-test:control",
      )
    ABTests.decorateRequest("X-GU-Server-AB-Tests")
  }

  "DotcomPuzzlesPageRenderingDataModel" should "serialize the complete puzzles rendering payload" in {
    val model = DotcomPuzzlesPageRenderingDataModel(
      StaticPages.dcrSimplePuzzlesPage("/puzzles-and-games"),
      layout,
      requestWithParticipations,
    )

    val json = DotcomPuzzlesPageRenderingDataModel.toJson(model)

    (json \ "id").as[String] should be("/puzzles-and-games")
    (json \ "webTitle").as[String] should be("Puzzles & games | The Guardian")
    (json \ "description").as[String] should be(
      "The Guardian's puzzles & games page, where you can play free online daily crosswords, word games, logic puzzles and more",
    )
    (json \ "editionId").as[String] should not be empty
    (json \ "nav").toOption should not be empty
    (json \ "pageFooter").toOption should not be empty
    (json \ "commercialProperties").toOption should not be empty
    (json \ "canonicalUrl").as[String] should endWith("/puzzles-and-games")
    (json \ "layout").as[PuzzlesLayout] should be(layout)
    val puzzlesNav = (json \ "nav" \ "otherLinks").as[Seq[play.api.libs.json.JsObject]]
    puzzlesNav
      .find(link => (link \ "url").as[String] == "/puzzles-and-games")
      .map(link => (link \ "title").as[String]) shouldBe None
    (json \ "nav" \ "subNavSections" \ "parent" \ "title").as[String] should be("Puzzles & games")
  }

  it should "propagate every current server-side AB-test participation" in {
    val model = DotcomPuzzlesPageRenderingDataModel(
      StaticPages.dcrSimplePuzzlesPage("/puzzles-and-games"),
      layout,
      requestWithParticipations,
    )

    val participations = (DotcomPuzzlesPageRenderingDataModel.toJson(model) \ "config" \ "serverSideABTests")
      .as[Map[String, String]]

    participations should contain theSameElementsAs Map(
      "puzzles-new-hub-v1" -> "variant",
      "another-test" -> "control",
    )
  }

  it should "supply the documented archive page title and description" in {
    val description =
      "Play the full archive of crosswords from the Guardian. Track your progress of what you've played and started."
    val page = StaticPages.dcrSimplePuzzlesArchivePage(
      "/puzzles-and-games/crosswords/archive",
      "Crosswords",
      description,
    )

    page.metadata.webTitle should be("Crosswords archive - puzzles & games | The Guardian")
    page.metadata.description should contain(description)
  }

  it should "send hub sponsorship as commercial properties for sponsored editions only" in {
    val sponsor = PuzzleSponsor(
      name = "Example sponsor",
      label = "Supported by",
      sponsorUri = "https://example.com",
      aboutUri = Some("https://example.com/about"),
      logo = PuzzleSponsorLogo("https://example.com/logo.png", None, 2),
    )
    val sponsoredLayout = layout.copy(sponsorship = Map("AU" -> sponsor))
    val hub = DotcomPuzzlesPageRenderingDataModel.toJson(
      DotcomPuzzlesPageRenderingDataModel(
        StaticPages.dcrSimplePuzzlesPage("/puzzles-and-games"),
        sponsoredLayout,
        requestWithParticipations,
      ),
    )

    (hub \ "commercialProperties" \ "AU" \ "branding" \ "sponsorName").as[String] should be("Example sponsor")
    (hub \ "commercialProperties" \ "AU" \ "branding" \ "brandingType" \ "name").as[String] should be("sponsored")
    (hub \ "commercialProperties" \ "AU" \ "branding" \ "logo" \ "dimensions" \ "width").as[Int] should be(200)
    (hub \ "commercialProperties" \ "UK").toOption shouldBe None
    (hub \ "layout" \ "sponsorship").toOption shouldBe None

    val archive = DotcomPuzzlesPageRenderingDataModel.toJson(
      DotcomPuzzlesPageRenderingDataModel.archive(
        StaticPages.dcrSimplePuzzlesArchivePage("/puzzles-and-games/crosswords/archive", "Crosswords", ""),
        sponsoredLayout,
        PuzzlesArchive(
          category = "crosswords",
          title = "Crosswords",
          description = "",
          selectedPuzzle = PuzzlesArchivePuzzle("quick", "Quick", "CROSSWORD_QUICK", None, "quick"),
          puzzles = Seq.empty,
          year = 2026,
          month = 10,
          items = Seq.empty,
          hasError = false,
          moreFrom = Seq.empty,
        ),
        requestWithParticipations,
      ),
    )
    (archive \ "commercialProperties" \ "AU").toOption shouldBe None
  }
}
