package test

import ab.ABTests
import controllers.{PuzzlesApiItem, PuzzlesArchiveApi, PuzzlesLayoutProvider, PuzzlesPageController, PuzzlesProgressApi}
import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.{Content => ApiContent, Crossword, CrosswordType, SearchResponse}
import contentapi.ContentApiClient
import model.dotcomrendering.{PuzzleContent, PuzzleContainer, PuzzleItem, PuzzlesLayout}
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{verify, verifyNoInteractions, when}
import org.scalatest.DoNotDiscover
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import play.api.mvc.{AnyContent, Headers, Request, RequestHeader, Results}
import play.api.test.Helpers._
import renderers.DotcomRenderingService

import java.time.{LocalDate, ZoneId}
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
      puzzlesArchiveApi: PuzzlesArchiveApi = mock[PuzzlesArchiveApi],
      puzzlesProgressApi: PuzzlesProgressApi = mock[PuzzlesProgressApi],
  ): PuzzlesPageController =
    new PuzzlesPageController(
      mock[WSClient],
      provider,
      puzzlesArchiveApi,
      puzzlesProgressApi,
      renderer,
      crosswordContentApiClient,
      stubControllerComponents(),
    )

  /** CAPI stub that returns a single quick crossword (number 100) for every "most recent crossword" query. */
  private def crosswordContentApiClient: ContentApiClient = {
    val crossword = mock[Crossword]
    when(crossword.`type`).thenReturn(CrosswordType.Quick)
    when(crossword.number).thenReturn(100)
    val content = mock[ApiContent]
    when(content.crossword).thenReturn(Some(crossword))
    val response = mock[SearchResponse]
    when(response.results).thenReturn(Seq(content))
    val client = mock[ContentApiClient]
    when(client.getResponse(any[SearchQuery])).thenReturn(Future.successful(response))
    client
  }

  private def successfulProvider: PuzzlesLayoutProvider = {
    val provider = mock[PuzzlesLayoutProvider]
    when(provider.getLayout()(any[ExecutionContext])).thenReturn(Future.successful(layout))
    provider
  }

  private def archiveProvider: PuzzlesLayoutProvider = {
    val provider = mock[PuzzlesLayoutProvider]
    val archiveLayout = PuzzlesLayout(
      containers = Seq(
        PuzzleContainer(
          id = "crosswords",
          title = "Crosswords",
          content = PuzzleContent(
            items = Seq.empty,
            nestedContainers = Seq.empty,
            archiveChoices = Some(
              Seq(
                PuzzleItem("archive-quick", "Quick", "crossword", "quick", "archive"),
                PuzzleItem("archive-mini", "Mini", "crossword", "mini", "archive"),
              ),
            ),
          ),
        ),
      ),
    )
    when(provider.getLayout()(any[ExecutionContext])).thenReturn(Future.successful(archiveLayout))
    provider
  }

  private def request(path: String, participations: String = "puzzles-new-hub-v1:variant"): Request[AnyContent] = {
    val rawRequest = TestRequest(path).withHeaders("X-GU-Server-AB-Tests" -> participations)
    rawRequest.withAttrs(ABTests.decorateRequest("X-GU-Server-AB-Tests")(rawRequest).attrs)
  }

  "archiveDataForMonth" should "serve calendar requests without requiring AB participation" in {
    val archiveApi = mock[PuzzlesArchiveApi]
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], eqTo(Option.empty[String]))(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))

    val result = controller(archiveProvider, mock[DotcomRenderingService], archiveApi)
      .archiveDataForMonth("crosswords", "archive-quick", 2020, 9)(
        request(
          "/puzzles-and-games/crosswords/archive-data/archive-quick/2020/9",
          participations = "",
        ),
      )

    status(result) should be(OK)
    header("Cache-Control", result) should contain("private, no-store, no-cache")
    verify(archiveApi)
      .get(
        eqTo(LocalDate.of(2020, 9, 1)),
        eqTo(LocalDate.of(2020, 9, 30)),
        eqTo("CROSSWORD_QUICK"),
        eqTo(Option.empty[String]),
      )(
        any[ExecutionContext],
      )
  }

  it should "forward an authenticated user's token to the archive API" in {
    val archiveApi = mock[PuzzlesArchiveApi]
    when(
      archiveApi.get(
        any[LocalDate],
        any[LocalDate],
        any[String],
        eqTo(Some("Bearer access-token")),
      )(any[ExecutionContext]),
    ).thenReturn(Future.successful(Nil))

    val result = controller(archiveProvider, mock[DotcomRenderingService], archiveApi)
      .archiveDataForMonth("crosswords", "archive-quick", 2020, 9)(
        request("/puzzles-and-games/crosswords/archive-data/archive-quick/2020/9")
          .withHeaders(Headers("Authorization" -> "Bearer access-token")),
      )

    status(result) should be(OK)
    verify(archiveApi).get(
      any[LocalDate],
      any[LocalDate],
      eqTo("CROSSWORD_QUICK"),
      eqTo(Some("Bearer access-token")),
    )(any[ExecutionContext])
  }

  it should "clamp future requests to the current month and current date" in {
    val archiveApi = mock[PuzzlesArchiveApi]
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], eqTo(Option.empty[String]))(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))
    val today = LocalDate.now(ZoneId.of("Europe/London"))

    val result = controller(archiveProvider, mock[DotcomRenderingService], archiveApi)
      .archiveDataForMonth("crosswords", "archive-quick", 2999, 12)(
        request(
          "/puzzles-and-games/crosswords/archive-data/archive-quick/2999/12",
          participations = "",
        ),
      )

    status(result) should be(OK)
    verify(archiveApi)
      .get(
        eqTo(today.minusDays(31)),
        eqTo(today),
        eqTo("CROSSWORD_QUICK"),
        eqTo(Option.empty[String]),
      )(any[ExecutionContext])
  }

  it should "use the path selection without query parameters or AB participation" in {
    val archiveApi = mock[PuzzlesArchiveApi]
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], eqTo(Option.empty[String]))(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))
    val result = controller(archiveProvider, mock[DotcomRenderingService], archiveApi)
      .archiveDataForMonth("crosswords", "archive-mini", 2020, 8)(
        request("/puzzles-and-games/crosswords/archive-data/archive-mini/2020/8", participations = ""),
      )

    status(result) should be(OK)
    (contentAsJson(result) \ "selectedPuzzle" \ "id").as[String] should be("archive-mini")
    (contentAsJson(result) \ "year").as[Int] should be(2020)
    (contentAsJson(result) \ "month").as[Int] should be(8)
    (contentAsJson(result) \ "dataUrl").toOption should be(None)
    verify(archiveApi).get(
      eqTo(LocalDate.of(2020, 8, 1)),
      eqTo(LocalDate.of(2020, 8, 31)),
      eqTo("CROSSWORD_MINI"),
      eqTo(Option.empty[String]),
    )(
      any[ExecutionContext],
    )
  }

  it should "reject invalid months before calling the API" in {
    val archiveApi = mock[PuzzlesArchiveApi]
    val result = controller(archiveProvider, mock[DotcomRenderingService], archiveApi)
      .archiveDataForMonth("crosswords", "archive-mini", 2020, 13)(request("/", participations = ""))
    status(result) should be(BAD_REQUEST)
    verifyNoInteractions(archiveApi)
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
    (json \ "webTitle").as[String] should be("Puzzles & games | The Guardian")
    (json \ "description").as[String] should be(
      "The Guardian's puzzles & games page, where you can play free online daily crosswords, word games, logic puzzles and more",
    )
    (json \ "layout").as[JsValue] should be(Json.toJson(layout))
  }

  "puzzlesProgress" should "return uncached progress and forward an authenticated user's token" in {
    val progressApi = mock[PuzzlesProgressApi]
    val item = PuzzlesApiItem(
      puzzleId = "123",
      puzzleType = "CROSSWORD_QUICK",
      publishDate = "2026-10-02T00:00:00Z",
      progress = 100,
      setterName = Some("A setter"),
      gameUrl = Some("/crosswords/quick/123"),
    )
    when(
      progressApi.query(
        any[LocalDate],
        eqTo(PuzzlesPageController.ProgressPuzzleTypes),
        eqTo(Some("Bearer access-token")),
      )(any[ExecutionContext]),
    ).thenReturn(Future.successful(Seq(item)))

    val result = controller(
      successfulProvider,
      mock[DotcomRenderingService],
      puzzlesProgressApi = progressApi,
    )
      .puzzlesProgress()(
        request("/puzzles-and-games/progress").withHeaders(Headers("Authorization" -> "Bearer access-token")),
      )

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    header("Cache-Control", result) should contain("private, no-store, no-cache")
    (contentAsJson(result) \ "results").as[Seq[PuzzlesApiItem]] shouldBe Seq(item)
    verify(progressApi).query(
      any[LocalDate],
      eqTo(PuzzlesPageController.ProgressPuzzleTypes),
      eqTo(Some("Bearer access-token")),
    )(any[ExecutionContext])
  }

  it should "query progress for signed-out users without an Authorization header" in {
    val progressApi = mock[PuzzlesProgressApi]
    when(
      progressApi.query(any[LocalDate], any[Seq[String]], eqTo(Option.empty[String]))(any[ExecutionContext]),
    ).thenReturn(Future.successful(Nil))

    val result = controller(
      successfulProvider,
      mock[DotcomRenderingService],
      puzzlesProgressApi = progressApi,
    )
      .puzzlesProgress()(request("/puzzles-and-games/progress"))

    status(result) should be(OK)
    verify(progressApi).query(any[LocalDate], any[Seq[String]], eqTo(Option.empty[String]))(
      any[ExecutionContext],
    )
  }

  "renderPuzzlesJson" should "return not found when the JSON action receives an HTML request" in {
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
    "control" -> "puzzles-new-hub-v1:control",
    "absent" -> "",
    "malformed" -> "puzzles-new-hub-v1:,puzzles-new-hub-v1:variant:extra",
    "unknown group" -> "puzzles-new-hub-v1:unknown",
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
    * `/puzzles-and-games/{group}/{game}/{date}`, gated behind the same `PuzzlesHubV1Experiment` ("puzzles-new-hub-v1")
    * AB test as the hub actions above - reusing the existing experiment rather than a new one. Crosswords are
    * explicitly out of scope for Puzzle Page and are not exercised by these tests.
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

    val related = (json \ "instance" \ "moreFromPuzzlesAndGames").as[Seq[PuzzleItem]]
    related.map(_.id) should be(Seq("sudoku-killer", "sudoku-hard", "sudoku-medium"))
    related.map(_.url) should be(
      Seq(
        Some("/puzzles-and-games/logic-puzzles/sudoku-killer/2024-01-14"),
        Some("/puzzles-and-games/logic-puzzles/sudoku-hard/2024-01-15"),
        Some("/puzzles-and-games/logic-puzzles/sudoku-medium/2024-01-15"),
      ),
    )
    related.map(_.cardVariant) should be(Seq("compact", "compact", "compact"))
    related.map(_.cadence) should be(Seq(Some("Yesterday"), Some("Today"), Some("Today")))
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

    val related = (json \ "instance" \ "moreFromPuzzlesAndGames").as[Seq[PuzzleItem]]
    related.map(_.id) should be(Seq("word-wheel", "crossword-quick", "crossword-mini"))
    related.map(_.url) should be(
      Seq(
        Some("/puzzles-and-games/word-games/word-wheel/2024-01-14"),
        Some("/crosswords/quick/100"),
        Some("/crosswords/quick/100"),
      ),
    )
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

    val related = (json \ "instance" \ "moreFromPuzzlesAndGames").as[Seq[PuzzleItem]]
    related.map(_.id) should be(Seq("crossword-mini", "word-wheel", "sudoku-easy"))
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
    "control" -> "puzzles-new-hub-v1:control",
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
