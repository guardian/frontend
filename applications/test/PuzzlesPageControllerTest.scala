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

  /** Puzzle Page: a generic page template for iframe-based puzzle types, nested under
    * `/puzzles-and-games/{group}/{game}/{date}`, gated behind the same `PuzzlesHubExperiment` ("puzzles-new-hub") AB
    * test as the hub actions above - reusing the existing experiment rather than a new one. Crosswords are explicitly
    * out of scope for Puzzle Page and are not exercised by these tests.
    */
  private def stubbedPuzzlePageRenderer(): DotcomRenderingService = {
    val renderer = mock[DotcomRenderingService]
    when(renderer.getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader]))
      .thenReturn(Future.successful(Results.Ok("rendered by DCR")))
    renderer
  }

  "renderSudoku" should "render a sudoku variant via DCR, using the flattened sudoku-<variant> slug and given date" in {
    val renderer = stubbedPuzzlePageRenderer()

    val result = controller(successfulProvider, renderer)
      .renderSudoku("easy", "2024-01-15")(request("/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(renderer).getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  it should "return not found for an unrecognised variant" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .renderSudoku("not-a-real-variant", "2024-01-15")(
        request("/puzzles-and-games/logic-puzzles/sudoku-not-a-real-variant/2024-01-15"),
      )

    status(result) should be(NOT_FOUND)
    verifyNoInteractions(renderer)
  }

  "renderSudokuJson" should "return the equivalent rendering data as JSON, with the flattened slug and the given puzzleDate" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderSudokuJson("killer", "2024-01-15")(
        request("/puzzles-and-games/logic-puzzles/sudoku-killer/2024-01-15.json"),
      )

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    val json = Json.parse(contentAsString(result))
    (json \ "slug").as[String] should be("sudoku-killer")
    (json \ "instance" \ "title").as[String] should be("Killer sudoku")
    (json \ "instance" \ "puzzleDate").as[String] should be("2024-01-15")
  }

  "redirectSudokuArchive" should "temporarily redirect to the logic-puzzles archive, filtered to this sudoku variant" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .redirectSudokuArchive("easy")(request("/puzzles-and-games/logic-puzzles/sudoku-easy"))

    status(result) should be(FOUND)
    redirectLocation(result) should be(Some("/puzzles-and-games/logic-puzzles/archive?puzzle=sudoku-easy"))
    verifyNoInteractions(renderer)
  }

  it should "return not found for an unrecognised variant" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .redirectSudokuArchive("not-a-real-variant")(
        request("/puzzles-and-games/logic-puzzles/sudoku-not-a-real-variant"),
      )

    status(result) should be(NOT_FOUND)
    verifyNoInteractions(renderer)
  }

  "renderWordWheel" should "render word wheel via DCR with the given date" in {
    val renderer = stubbedPuzzlePageRenderer()

    val result = controller(successfulProvider, renderer)
      .renderWordWheel("2024-01-15")(request("/puzzles-and-games/word-games/word-wheel/2024-01-15"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(renderer).getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  it should "return not found when the experiment is not enabled, without calling DCR" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .renderWordWheel("2024-01-15")(request("/puzzles-and-games/word-games/word-wheel/2024-01-15", ""))

    status(result) should be(NOT_FOUND)
    verifyNoInteractions(renderer)
  }

  "renderWordWheelJson" should "return the equivalent rendering data as JSON, including the given puzzleDate" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderWordWheelJson("2024-01-15")(request("/puzzles-and-games/word-games/word-wheel/2024-01-15.json"))

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    val json = Json.parse(contentAsString(result))
    (json \ "slug").as[String] should be("word-wheel")
    (json \ "instance" \ "title").as[String] should be("Word wheel")
    (json \ "instance" \ "puzzleDate").as[String] should be("2024-01-15")
  }

  "redirectWordWheelArchive" should "temporarily redirect to the word-games archive, filtered to word wheel" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .redirectWordWheelArchive()(request("/puzzles-and-games/word-games/word-wheel"))

    status(result) should be(FOUND)
    redirectLocation(result) should be(Some("/puzzles-and-games/word-games/archive?puzzle=word-wheel"))
    verifyNoInteractions(renderer)
  }

  "renderWordiply" should "render wordiply via DCR with the given date" in {
    val renderer = stubbedPuzzlePageRenderer()

    val result = controller(successfulProvider, renderer)
      .renderWordiply("2024-01-15")(request("/puzzles-and-games/word-games/wordiply/2024-01-15"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(renderer).getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  it should "return not found when the experiment is not enabled, without calling DCR" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .renderWordiply("2024-01-15")(request("/puzzles-and-games/word-games/wordiply/2024-01-15", ""))

    status(result) should be(NOT_FOUND)
    verifyNoInteractions(renderer)
  }

  "renderWordiplyJson" should "return the equivalent rendering data as JSON, including the given puzzleDate" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .renderWordiplyJson("2024-01-15")(request("/puzzles-and-games/word-games/wordiply/2024-01-15.json"))

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    val json = Json.parse(contentAsString(result))
    (json \ "slug").as[String] should be("wordiply")
    (json \ "instance" \ "title").as[String] should be("Wordiply")
    (json \ "instance" \ "puzzleDate").as[String] should be("2024-01-15")
  }

  "redirectWordiplyArchive" should "temporarily redirect to the word-games archive, filtered to wordiply" in {
    val renderer = mock[DotcomRenderingService]

    val result = controller(successfulProvider, renderer)
      .redirectWordiplyArchive()(request("/puzzles-and-games/word-games/wordiply"))

    status(result) should be(FOUND)
    redirectLocation(result) should be(Some("/puzzles-and-games/word-games/archive?puzzle=wordiply"))
    verifyNoInteractions(renderer)
  }

  Seq(
    "control" -> "puzzles-new-hub:control",
    "absent" -> "",
    "unrelated experiment" -> "another-test:variant",
  ).foreach { case (participationCase, participations) =>
    s"puzzle page access with $participationCase participation" should
      "return not found for sudoku, word wheel, and wordiply (both dated and archive-redirect routes) without calling DCR" in {
        val renderer = mock[DotcomRenderingService]
        val puzzlesController = controller(successfulProvider, renderer)

        val sudokuResult = puzzlesController.renderSudoku("easy", "2024-01-15")(
          request("/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15", participations),
        )
        val sudokuRedirectResult = puzzlesController.redirectSudokuArchive("easy")(
          request("/puzzles-and-games/logic-puzzles/sudoku-easy", participations),
        )
        val wordWheelResult = puzzlesController.renderWordWheel("2024-01-15")(
          request("/puzzles-and-games/word-games/word-wheel/2024-01-15", participations),
        )
        val wordiplyResult = puzzlesController.renderWordiply("2024-01-15")(
          request("/puzzles-and-games/word-games/wordiply/2024-01-15", participations),
        )

        status(sudokuResult) should be(NOT_FOUND)
        status(sudokuRedirectResult) should be(NOT_FOUND)
        status(wordWheelResult) should be(NOT_FOUND)
        status(wordiplyResult) should be(NOT_FOUND)
        verifyNoInteractions(renderer)
      }
  }
}
