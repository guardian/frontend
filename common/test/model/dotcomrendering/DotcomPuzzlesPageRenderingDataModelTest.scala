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
        title = "Daily puzzles",
        content = PuzzleContent(
          items = Seq(Seq(PuzzleItem("Quick crossword", "crossword", "quick"))),
          nestedContainers = Seq.empty,
        ),
      ),
    ),
  )

  private def requestWithParticipations: RequestHeader = {
    implicit val request: RequestHeader = FakeRequest("GET", "/puzzles")
      .withHeaders(
        "Host" -> "www.theguardian.com",
        "X-GU-Server-AB-Tests" -> "puzzles-new-hub:variant,another-test:control",
      )
    ABTests.decorateRequest("X-GU-Server-AB-Tests")
  }

  "DotcomPuzzlesPageRenderingDataModel" should "serialize the complete puzzles rendering payload" in {
    val model = DotcomPuzzlesPageRenderingDataModel(
      StaticPages.dcrSimplePuzzlesPage("/puzzles"),
      layout,
      requestWithParticipations,
    )

    val json = DotcomPuzzlesPageRenderingDataModel.toJson(model)

    (json \ "id").as[String] should be("/puzzles")
    (json \ "webTitle").as[String] should be("Puzzles and Games")
    (json \ "editionId").as[String] should not be empty
    (json \ "nav").toOption should not be empty
    (json \ "pageFooter").toOption should not be empty
    (json \ "commercialProperties").toOption should not be empty
    (json \ "canonicalUrl").as[String] should endWith("/puzzles")
    (json \ "layout").as[PuzzlesLayout] should be(layout)
  }

  it should "propagate every current server-side AB-test participation" in {
    val model = DotcomPuzzlesPageRenderingDataModel(
      StaticPages.dcrSimplePuzzlesPage("/puzzles"),
      layout,
      requestWithParticipations,
    )

    val participations = (DotcomPuzzlesPageRenderingDataModel.toJson(model) \ "config" \ "serverSideABTests")
      .as[Map[String, String]]

    participations should contain theSameElementsAs Map(
      "puzzles-new-hub" -> "variant",
      "another-test" -> "control",
    )
  }
}
