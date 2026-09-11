package test

import ab.ABTests
import controllers.{PuzzlesLayoutProvider, PuzzlesPageController}
import model.dotcomrendering.{PuzzleContent, PuzzleContainer, PuzzleItem, PuzzlesLayout}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{verify, verifyNoInteractions, when}
import org.scalatest.DoNotDiscover
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import play.api.mvc.{AnyContent, Request, RequestHeader, Results}
import play.api.test.Helpers._
import renderers.DotcomRenderingService

import java.time.LocalDate
import scala.concurrent.{ExecutionContext, Future}

@DoNotDiscover class PuzzlesPageControllerTest
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with WithTestApplicationContext {

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

  private def controller(
      provider: PuzzlesLayoutProvider,
      renderer: DotcomRenderingService,
  ): PuzzlesPageController =
    new PuzzlesPageController(
      mock[WSClient],
      provider,
      renderer,
      stubControllerComponents(),
    )

  private def successfulProvider: PuzzlesLayoutProvider = {
    val provider = mock[PuzzlesLayoutProvider]
    when(provider.getLayout()(any[ExecutionContext])).thenReturn(Future.successful(layout))
    provider
  }

  private def request(path: String, participations: String = "puzzles-new-hub:variant"): Request[AnyContent] = {
    val rawRequest = TestRequest(path).withHeaders("X-GU-Server-AB-Tests" -> participations)
    rawRequest.withAttrs(ABTests.decorateRequest("X-GU-Server-AB-Tests")(rawRequest).attrs)
  }

  "renderPuzzles" should "load the layout and render the DCR puzzles page" in {
    val provider = successfulProvider
    val renderer = mock[DotcomRenderingService]
    when(renderer.getPuzzlesPage(any[WSClient], any[JsValue])(any[RequestHeader]))
      .thenReturn(Future.successful(Results.Ok("rendered by DCR")))

    val result = controller(provider, renderer).renderPuzzles()(request("/puzzles-and-games"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(provider).getLayout()(any[ExecutionContext])
    verify(renderer).getPuzzlesPage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  it should "return not found for an unsupported format" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzles()(request("/puzzles-and-games.json"))

    status(result) should be(NOT_FOUND)
  }

  it should "propagate layout provider failures" in {
    val failure = new RuntimeException("layout failed")
    val provider = mock[PuzzlesLayoutProvider]
    when(provider.getLayout()(any[ExecutionContext])).thenReturn(Future.failed(failure))

    val result = controller(provider, mock[DotcomRenderingService]).renderPuzzles()(request("/puzzles-and-games"))

    result.failed.futureValue should be(failure)
  }

  it should "propagate DCR renderer failures" in {
    val failure = new RuntimeException("renderer failed")
    val renderer = mock[DotcomRenderingService]
    when(renderer.getPuzzlesPage(any[WSClient], any[JsValue])(any[RequestHeader]))
      .thenReturn(Future.failed(failure))

    val result = controller(successfulProvider, renderer).renderPuzzles()(request("/puzzles-and-games"))

    result.failed.futureValue should be(failure)
  }

  "renderPuzzlesJson" should "return the equivalent rendering data as JSON" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzlesJson()(request("/puzzles-and-games.json"))

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    val json = Json.parse(contentAsString(result))
    (json \ "id").as[String] should be("/puzzles-and-games.json")
    (json \ "webTitle").as[String] should be("Puzzles and games")
    (json \ "layout").as[JsValue] should be(Json.toJson(layout))
  }

  it should "return not found when the JSON action receives an HTML request" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzlesJson()(request("/puzzles-and-games"))

    status(result) should be(NOT_FOUND)
  }

  it should "return not found for another unsupported format" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzlesJson()(request("/puzzles-and-games.atom"))

    status(result) should be(NOT_FOUND)
  }

  Seq(
    "control" -> "puzzles-new-hub:control",
    "absent" -> "",
    "malformed" -> "puzzles-new-hub:,puzzles-new-hub:variant:extra",
    "unknown group" -> "puzzles-new-hub:unknown",
    "unrelated experiment" -> "another-test:variant",
  ).foreach { case (participationCase, participations) =>
    s"puzzles hub access with $participationCase participation" should
      "return not found for HTML and JSON without loading the layout or calling DCR" in {
        val provider = mock[PuzzlesLayoutProvider]
        val renderer = mock[DotcomRenderingService]
        val puzzlesController = controller(provider, renderer)

        val htmlResult = puzzlesController.renderPuzzles()(request("/puzzles-and-games", participations))
        val jsonResult = puzzlesController.renderPuzzlesJson()(request("/puzzles-and-games.json", participations))

        status(htmlResult) should be(NOT_FOUND)
        status(jsonResult) should be(NOT_FOUND)
        verifyNoInteractions(provider, renderer)
      }
  }

  /** Puzzle Page: a generic page template for iframe-based puzzle types, gated behind the same `PuzzlesHubExperiment`
    * ("puzzles-new-hub") AB test as the hub actions above - reusing the existing experiment rather than a new one.
    * Crosswords are explicitly out of scope for Puzzle Page and are not exercised by these tests.
    */
  private def stubbedPuzzlePageRenderer(): DotcomRenderingService = {
    val renderer = mock[DotcomRenderingService]
    when(renderer.getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader]))
      .thenReturn(Future.successful(Results.Ok("rendered by DCR")))
    renderer
  }

  "renderSudoku" should "render a sudoku variant via DCR, using the flattened sudoku-<variant> slug for DCR" in {
    val renderer = stubbedPuzzlePageRenderer()

    val result =
      controller(successfulProvider, renderer).renderSudoku("easy")(request("/puzzles-and-games/sudoku/easy"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(renderer).getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  it should "return not found for an unrecognised variant" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .renderSudoku("not-a-real-variant")(request("/puzzles-and-games/sudoku/not-a-real-variant"))

    status(result) should be(NOT_FOUND)
    verifyNoInteractions(renderer)
  }

  "renderSudokuJson" should "return the equivalent rendering data as JSON, with the flattened slug and today's puzzleDate" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderSudokuJson("killer")(request("/puzzles-and-games/sudoku/killer.json"))

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    val json = Json.parse(contentAsString(result))
    (json \ "slug").as[String] should be("sudoku-killer")
    (json \ "instance" \ "title").as[String] should be("Killer sudoku")
    (json \ "instance" \ "puzzleDate").as[String] should be(LocalDate.now().toString)
  }

  it should "use the ?date= query param for puzzleDate when given, instead of defaulting to today" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderSudokuJson("easy")(request("/puzzles-and-games/sudoku/easy.json?date=2020-01-01"))

    status(result) should be(OK)
    val json = Json.parse(contentAsString(result))
    (json \ "instance" \ "puzzleDate").as[String] should be("2020-01-01")
  }

  "renderPuzzlePage" should "render a flat (single-segment) slug via DCR" in {
    val renderer = stubbedPuzzlePageRenderer()

    val result =
      controller(successfulProvider, renderer).renderPuzzlePage("word-wheel")(request("/puzzles-and-games/word-wheel"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(renderer).getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  it should "return not found for an unrecognised slug" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .renderPuzzlePage("not-a-real-puzzle")(request("/puzzles-and-games/not-a-real-puzzle"))

    status(result) should be(NOT_FOUND)
    verifyNoInteractions(renderer)
  }

  it should "return not found for the sudoku slug (it is served by renderSudoku instead)" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .renderPuzzlePage("sudoku-easy")(request("/puzzles-and-games/sudoku-easy"))

    status(result) should be(NOT_FOUND)
    verifyNoInteractions(renderer)
  }

  "renderPuzzlePageJson" should "return the equivalent rendering data as JSON for a flat slug" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzlePageJson("wordiply")(request("/puzzles-and-games/wordiply.json"))

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    val json = Json.parse(contentAsString(result))
    (json \ "slug").as[String] should be("wordiply")
    (json \ "instance" \ "title").as[String] should be("Wordiply")
  }

  it should "return not found for an unrecognised slug" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderPuzzlePageJson("not-a-real-puzzle")(request("/puzzles-and-games/not-a-real-puzzle.json"))

    status(result) should be(NOT_FOUND)
  }

  Seq(
    "control" -> "puzzles-new-hub:control",
    "absent" -> "",
    "unrelated experiment" -> "another-test:variant",
  ).foreach { case (participationCase, participations) =>
    s"puzzle page access with $participationCase participation" should
      "return not found for sudoku and flat puzzle slugs without calling DCR" in {
        val renderer = mock[DotcomRenderingService]
        val puzzlesController = controller(successfulProvider, renderer)

        val sudokuResult =
          puzzlesController.renderSudoku("easy")(request("/puzzles-and-games/sudoku/easy", participations))
        val flatResult =
          puzzlesController.renderPuzzlePage("word-wheel")(request("/puzzles-and-games/word-wheel", participations))

        status(sudokuResult) should be(NOT_FOUND)
        status(flatResult) should be(NOT_FOUND)
        verifyNoInteractions(renderer)
      }
  }
}
