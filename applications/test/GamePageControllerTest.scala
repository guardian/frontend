package test

import controllers.GamePageController
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{verify, verifyNoInteractions, when}
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import play.api.mvc.{AnyContent, Request, RequestHeader, Results}
import play.api.test.Helpers._
import renderers.DotcomRenderingService

import scala.concurrent.Future

/** Tests for the new, isolated Game Page controller (see docs/puzzles-game-page-plan.md). These do not exercise, and
  * are entirely separate from, the existing crossword controller tests.
  *
  * Note: this flow is not gated behind any AB test (a previous `game-page-experiment` gate was removed at the user's
  * explicit request, since these routes are expected to be mapped/exposed via a separate project instead) - no special
  * request header is needed for any of these.
  */
@DoNotDiscover class GamePageControllerTest
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with BeforeAndAfterAll
    with ConfiguredTestSuite
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  private def controller(renderer: DotcomRenderingService): GamePageController =
    new GamePageController(testContentApiClient, stubControllerComponents(), wsClient, renderer)

  private def request(path: String): Request[AnyContent] = TestRequest(path)

  private def stubbedRenderer(): DotcomRenderingService = {
    val renderer = mock[DotcomRenderingService]
    when(renderer.getGamePage(any[WSClient], any[JsValue])(any[RequestHeader]))
      .thenReturn(Future.successful(Results.Ok("rendered by DCR")))
    renderer
  }

  "renderGame" should "render an iframe-based slug via DCR" in {
    val renderer = stubbedRenderer()

    val result = controller(renderer).renderGame("sudoku-easy")(request("/puzzles/sudoku-easy"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(renderer).getGamePage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  it should "return not found for an unrecognised slug" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(renderer).renderGame("not-a-real-game")(request("/puzzles/not-a-real-game"))

    status(result) should be(NOT_FOUND)
    verifyNoInteractions(renderer)
  }

  it should "return not found for the bare crossword slug (it is served by renderCrossword instead)" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(renderer).renderGame("crossword")(request("/puzzles/crossword"))

    status(result) should be(NOT_FOUND)
    verifyNoInteractions(renderer)
  }

  "renderCrossword" should "fetch real CAPI content and render the crossword slug via DCR" in {
    val renderer = stubbedRenderer()

    val result = controller(renderer)
      .renderCrossword("cryptic", 26697)(request("/puzzles/crossword/cryptic/26697"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(renderer).getGamePage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  "renderGameJson" should "return the equivalent rendering data as JSON for an iframe-based slug" in {
    val result = controller(mock[DotcomRenderingService])
      .renderGameJson("sudoku-easy")(request("/puzzles/sudoku-easy.json"))

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    val json = Json.parse(contentAsString(result))
    (json \ "slug").as[String] should be("sudoku-easy")
    (json \ "instance" \ "title").as[String] should be("Sudoku (easy)")
    (json \ "instance" \ "crosswordData").asOpt[JsValue] should be(None)
  }

  it should "return not found for an unrecognised slug" in {
    val result = controller(mock[DotcomRenderingService])
      .renderGameJson("not-a-real-game")(request("/puzzles/not-a-real-game.json"))

    status(result) should be(NOT_FOUND)
  }

  "renderCrosswordJson" should "return the equivalent rendering data as JSON, including real crosswordData" in {
    val result = controller(mock[DotcomRenderingService])
      .renderCrosswordJson("cryptic", 26697)(request("/puzzles/crossword/cryptic/26697.json"))

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    val json = Json.parse(contentAsString(result))
    (json \ "slug").as[String] should be("crossword")
    (json \ "instance" \ "puzzleType").as[String] should be("cryptic")
    (json \ "instance" \ "crosswordData").asOpt[JsValue] should not be None
  }
}
