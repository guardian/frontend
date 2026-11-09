package test

import controllers.PuzzlesAccessController
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.Json
import play.api.test.FakeRequest
import play.api.test.Helpers._

@DoNotDiscover class PuzzlesAccessControllerTest extends AnyFlatSpec with Matchers with WithTestApplicationContext {

  private val controller = new PuzzlesAccessController(stubControllerComponents())

  "access" should "answer 503 while the Puzzles API has no access endpoint, whoever asks" in {
    val withAuth = FakeRequest("GET", "/puzzles-and-games/access?puzzleId=guardian-sudoku-easy-20261009")
      .withHeaders(AUTHORIZATION -> "Bearer reader-token")
    val withoutAuth = FakeRequest("GET", "/puzzles-and-games/access?puzzleId=guardian-sudoku-easy-20261009")

    status(controller.access("guardian-sudoku-easy-20261009")(withAuth)) should be(SERVICE_UNAVAILABLE)
    status(controller.access("guardian-sudoku-easy-20261009")(withoutAuth)) should be(SERVICE_UNAVAILABLE)
  }

  it should "never be cached and say why in JSON" in {
    val result = controller.access("guardian-sudoku-easy-20261009")(FakeRequest("GET", "/puzzles-and-games/access"))

    header(CACHE_CONTROL, result).getOrElse("") should include("no-cache")
    (Json.parse(contentAsString(result)) \ "message").as[String] should include("not available")
  }
}
