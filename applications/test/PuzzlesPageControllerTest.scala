package test

import ab.ABTests
import controllers.{
  IndexController,
  PuzzlesApiItem,
  PuzzlesArchiveApi,
  PuzzlesGameApi,
  PuzzlesLayoutProvider,
  PuzzlesNewsletters,
  PuzzlesPageController,
  PuzzlesProgressApi,
}
import model.dotcomrendering.{
  PuzzleContent,
  PuzzleContainer,
  PuzzleItem,
  PuzzlesLayout,
  PuzzleSponsor,
  PuzzleSponsorLogo,
}
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{times, verify, verifyNoInteractions, when}
import org.scalatest.DoNotDiscover
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import play.api.mvc.{AnyContent, Headers, Request, RequestHeader, Results}
import play.api.test.Helpers._
import play.api.test.FakeRequest
import renderers.DotcomRenderingService
import services.newsletters.model.NewsletterResponseV2
import services.newsletters.{NewsletterApi, NewsletterSignupAgent}

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
      puzzlesArchiveApi: PuzzlesArchiveApi = successfulArchiveApi,
      puzzlesProgressApi: PuzzlesProgressApi = mock[PuzzlesProgressApi],
      newsletterAgent: NewsletterSignupAgent = new NewsletterSignupAgent(mock[NewsletterApi]),
      gameApi: PuzzlesGameApi = successfulGameApi,
      indexController: IndexController = mock[IndexController],
  ): PuzzlesPageController =
    new PuzzlesPageController(
      mock[WSClient],
      provider,
      puzzlesArchiveApi,
      puzzlesProgressApi,
      renderer,
      gameApi,
      new PuzzlesNewsletters(newsletterAgent),
      indexController,
      stubControllerComponents(),
    )

  private def successfulArchiveApi: PuzzlesArchiveApi = new PuzzlesArchiveApi {
    override def get(start: LocalDate, end: LocalDate, puzzleType: String, authorization: Option[String])(implicit
        ec: ExecutionContext,
    ): Future[Seq[PuzzlesApiItem]] =
      Future.successful(Seq(PuzzlesApiItem("100", puzzleType, end.toString, 0, None, Some("/crosswords/quick/100"))))
  }

  private def successfulGameApi: PuzzlesGameApi = new PuzzlesGameApi {
    override def get(puzzleType: String, date: LocalDate)(implicit
        ec: ExecutionContext,
    ): Future[Option[PuzzlesApiItem]] =
      Future.successful(
        Some(
          PuzzlesApiItem(
            "opaque-puzzle-id",
            puzzleType,
            date.toString,
            0,
            None,
            Some("https://tg.amuselabs.com/guardian/date-picker?id=opaque-puzzle-id&set=api-series&embed=1"),
          ),
        ),
      )
  }

  private def successfulProvider: PuzzlesLayoutProvider = {
    val provider = mock[PuzzlesLayoutProvider]
    when(provider.getLayout()(any[ExecutionContext])).thenReturn(Future.successful(layout))
    when(provider.getGameCommercialProperties(any[String])(any[ExecutionContext]))
      .thenReturn(Future.successful(Map.empty))
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

  private def request(
      path: String,
      participations: String = "puzzles-new-hub-v1:variant",
      edition: String = "UK",
  ): Request[AnyContent] = {
    val rawRequest = TestRequest(path).withHeaders("X-GU-Server-AB-Tests" -> participations, "X-Gu-Edition" -> edition)
    rawRequest.withAttrs(ABTests.decorateRequest("X-GU-Server-AB-Tests")(rawRequest).attrs)
  }

  private val allowedOrigin = "http://www.random.com" // Included in the test CORS configuration.

  "puzzlesDataOptions" should "allow GET preflights with Authorization from an approved origin" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .puzzlesDataOptions()(
        FakeRequest(OPTIONS, "/puzzles-and-games/progress").withHeaders(
          "Origin" -> allowedOrigin,
          "Access-Control-Request-Method" -> "GET",
          "Access-Control-Request-Headers" -> "authorization, cache-control",
        ),
      )

    status(result) should be(NO_CONTENT)
    header("Access-Control-Allow-Origin", result) should contain(allowedOrigin)
    header("Access-Control-Allow-Methods", result) should contain("GET, OPTIONS")
    header("Access-Control-Allow-Headers", result).get should include("authorization")
    header("Cache-Control", result) should contain("private, no-store, no-cache")
  }

  it should "not allow unapproved origins" in {
    val result = controller(successfulProvider, mock[DotcomRenderingService])
      .archiveDataOptions("archive-quick", 2020, 9)(
        FakeRequest(OPTIONS, "/puzzles-and-games/crosswords/archive-data/archive-quick/2020/9")
          .withHeaders("Origin" -> "https://untrusted.example", "Access-Control-Request-Headers" -> "authorization"),
      )

    header("Access-Control-Allow-Origin", result) should be(None)
  }

  "archiveDataOptions" should "allow authenticated calendar preflights without calling the API" in {
    val archiveApi = mock[PuzzlesArchiveApi]
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], any[Option[String]])(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))
    val result = controller(archiveProvider, mock[DotcomRenderingService], archiveApi)
      .archiveDataOptions("archive-quick", 2020, 9)(
        FakeRequest(OPTIONS, "/puzzles-and-games/crosswords/archive-data/archive-quick/2020/9").withHeaders(
          "Origin" -> allowedOrigin,
          "Access-Control-Request-Method" -> "GET",
          "Access-Control-Request-Headers" -> "authorization",
        ),
      )

    status(result) should be(NO_CONTENT)
    header("Access-Control-Allow-Origin", result) should contain(allowedOrigin)
    header("Access-Control-Allow-Methods", result) should contain("GET, OPTIONS")
    header("Access-Control-Allow-Headers", result).get should include("authorization")
    verifyNoInteractions(archiveApi)
  }

  "archiveDataForMonth" should "serve calendar requests without requiring AB participation" in {
    val archiveApi = mock[PuzzlesArchiveApi]
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], any[Option[String]])(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))
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
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], any[Option[String]])(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))
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
          .withHeaders(Headers("Authorization" -> "Bearer access-token", "Origin" -> allowedOrigin)),
      )

    status(result) should be(OK)
    header("Access-Control-Allow-Origin", result) should contain(allowedOrigin)
    header("Cache-Control", result) should contain("private, no-store, no-cache")
    verify(archiveApi, times(2)).get(
      any[LocalDate],
      any[LocalDate],
      eqTo("CROSSWORD_QUICK"),
      eqTo(Some("Bearer access-token")),
    )(any[ExecutionContext])
  }

  it should "clamp future requests to the current month and current date" in {
    val archiveApi = mock[PuzzlesArchiveApi]
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], any[Option[String]])(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))
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
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], any[Option[String]])(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))
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
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], any[Option[String]])(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))
    val result = controller(archiveProvider, mock[DotcomRenderingService], archiveApi)
      .archiveDataForMonth("crosswords", "archive-mini", 2020, 13)(
        request("/", participations = "").withHeaders(Headers("Origin" -> allowedOrigin)),
      )
    status(result) should be(BAD_REQUEST)
    header("Access-Control-Allow-Origin", result) should contain(allowedOrigin)
    header("Cache-Control", result) should contain("private, no-store, no-cache")
    verifyNoInteractions(archiveApi)
  }

  it should "return current recent cards separately from a historical calendar month" in {
    val archiveApi = mock[PuzzlesArchiveApi]
    when(archiveApi.get(any[LocalDate], any[LocalDate], any[String], any[Option[String]])(any[ExecutionContext]))
      .thenReturn(Future.successful(Nil))
    val today = LocalDate.now(ZoneId.of("Europe/London"))
    val historical =
      PuzzlesApiItem("old", "CROSSWORD_QUICK", "2020-09-30T00:00:00Z", 0, None, Some("/crosswords/quick/old"))
    val recent = (0 to 3).map { daysAgo =>
      PuzzlesApiItem(
        s"recent-$daysAgo",
        "CROSSWORD_QUICK",
        s"${today.minusDays(daysAgo)}T00:00:00Z",
        100,
        Some("Setter"),
        Some(s"/crosswords/quick/recent-$daysAgo"),
      )
    }
    when(
      archiveApi.get(
        eqTo(LocalDate.of(2020, 9, 1)),
        eqTo(LocalDate.of(2020, 9, 30)),
        eqTo("CROSSWORD_QUICK"),
        eqTo(Some("Bearer access-token")),
      )(any[ExecutionContext]),
    )
      .thenReturn(Future.successful(Seq(historical)))
    when(
      archiveApi.get(
        eqTo(today.minusDays(31)),
        eqTo(today),
        eqTo("CROSSWORD_QUICK"),
        eqTo(Some("Bearer access-token")),
      )(any[ExecutionContext]),
    )
      .thenReturn(Future.successful(recent.reverse))

    val result = controller(archiveProvider, mock[DotcomRenderingService], archiveApi)
      .archiveDataForMonth("crosswords", "archive-quick", 2020, 9)(
        request("/puzzles-and-games/crosswords/archive-data/archive-quick/2020/9")
          .withHeaders(Headers("Authorization" -> "Bearer access-token")),
      )

    status(result) should be(OK)
    val json = contentAsJson(result)
    (json \ "items").as[Seq[JsValue]].map(item => (item \ "date").as[String]) should be(Seq("2020-09-30"))
    val cards = (json \ "recentItems").as[Seq[JsValue]]
    cards.map(item => (item \ "date").as[String]) should be((0 to 2).map(today.minusDays(_).toString))
    cards.map(item => (item \ "progress").as[Int]) should be(Seq(100, 100, 100))
    (cards.head \ "url").as[String] should be("/crosswords/quick/recent-0")
    (cards.head \ "setterName").as[String] should be("Setter")
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

  private val v2Participations = "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:variant"

  Seq(
    "puzzles-new-hub-v1:variant" -> false,
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:control" -> false,
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:unknown" -> false,
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:,puzzles-new-hub-v2:variant:extra" -> false,
    v2Participations -> true,
  ).foreach { case (participations, enabled) =>
    "Puzzles hub trivia visibility" should s"require cumulative v2 participation in HTML and JSON: $participations" in {
      val trivia = PuzzleContainer(
        id = "trivia-and-quizzes",
        title = "Trivia & quizzes",
        variant = Some("standard"),
        content = PuzzleContent(
          Seq(Seq(PuzzleItem("film-reveal", "Film reveal", "film-reveal", "all", "primary"))),
          Seq.empty,
        ),
      )
      val quick = layout.containers.head.content.items.head.head
      val filmReveal = trivia.content.items.head.head
      val onTheBall = filmReveal.copy(id = "on-the-ball", `type` = "on-the-ball", title = "On the ball")
      val featuredQuick = quick.copy(id = "featured-quick")
      val nestedQuick = quick.copy(id = "nested-quick")
      val archiveQuick = quick.copy(id = "archive-quick", cardVariant = "archive")
      val v1Nested = layout.containers.head.copy(
        id = "nested-v1",
        content = PuzzleContent(Seq(Seq(nestedQuick)), Nil),
      )
      val v1Featured = layout.containers.head.copy(
        id = "featured-puzzles",
        variant = Some("featured"),
        content = PuzzleContent(
          Seq(Seq(featuredQuick)),
          Seq(v1Nested),
          archiveChoices = Some(Seq(archiveQuick)),
        ),
      )
      val featuredWithV2Games = v1Featured.copy(content =
        v1Featured.content.copy(
          items = Seq(Seq(featuredQuick, filmReveal.copy(id = "featured-film"), onTheBall.copy(id = "featured-ball"))),
          nestedContainers = Seq(
            v1Nested.copy(content =
              v1Nested.content.copy(
                items = Seq(Seq(nestedQuick, onTheBall.copy(id = "nested-ball"), filmReveal.copy(id = "nested-film"))),
                archive = Some(filmReveal.copy(id = "nested-film-archive", cardVariant = "archive")),
              ),
            ),
          ),
          archiveChoices = Some(
            Seq(
              filmReveal.copy(id = "archive-film", cardVariant = "archive"),
              archiveQuick,
              onTheBall.copy(id = "archive-ball", cardVariant = "archive"),
            ),
          ),
        ),
      )
      val v1Layout = layout.copy(containers = layout.containers :+ v1Featured)
      val fullLayout = v1Layout.copy(containers = layout.containers ++ Seq(featuredWithV2Games, trivia))
      val expectedLayout = if (enabled) fullLayout else v1Layout
      val provider = mock[PuzzlesLayoutProvider]
      when(provider.getLayout()(any[ExecutionContext])).thenReturn(Future.successful(fullLayout))
      val renderer = mock[DotcomRenderingService]
      when(renderer.getPuzzlesPage(any[WSClient], any[JsValue])(any[RequestHeader]))
        .thenReturn(Future.successful(Results.Ok("rendered by DCR")))
      val c = controller(provider, renderer)
      val html = c.renderPuzzles()(request("/puzzles-and-games", participations))
      status(html) shouldBe OK
      val payload = ArgumentCaptor.forClass(classOf[JsValue])
      verify(renderer).getPuzzlesPage(any[WSClient], payload.capture())(any[RequestHeader])
      val json = c.renderPuzzlesJson()(request("/puzzles-and-games.json", participations))
      status(json) shouldBe OK
      (payload.getValue \ "layout").as[PuzzlesLayout] shouldBe expectedLayout
      (contentAsJson(json) \ "layout").as[PuzzlesLayout] shouldBe expectedLayout
    }
  }

  "V1 archive rendering" should "use the filtered layout rather than exposing trivia through archive pages" in {
    val crosswords = PuzzleContainer(
      "crosswords",
      "Crosswords",
      content = PuzzleContent(
        Nil,
        Nil,
        archiveChoices = Some(
          Seq(
            PuzzleItem("archive-quick", "Quick", "crossword", "quick", "archive"),
          ),
        ),
      ),
    )
    val trivia = PuzzleContainer(
      "trivia-and-quizzes",
      "Trivia & quizzes",
      content = PuzzleContent(Seq(Seq(PuzzleItem("film-reveal", "Film reveal", "film-reveal", "all", "primary"))), Nil),
    )
    val provider = mock[PuzzlesLayoutProvider]
    when(provider.getLayout()(any[ExecutionContext]))
      .thenReturn(Future.successful(layout.copy(containers = Seq(crosswords, trivia))))
    val renderer = mock[DotcomRenderingService]
    when(renderer.getPuzzlesPage(any[WSClient], any[JsValue])(any[RequestHeader]))
      .thenReturn(Future.successful(Results.Ok("rendered by DCR")))

    status(
      controller(provider, renderer).renderCrosswordsArchive()(request("/puzzles-and-games/crosswords/archive")),
    ) shouldBe OK
    val payload = ArgumentCaptor.forClass(classOf[JsValue])
    verify(renderer).getPuzzlesPage(any[WSClient], payload.capture())(any[RequestHeader])
    (payload.getValue \ "layout").as[PuzzlesLayout] shouldBe layout.copy(containers = Seq(crosswords))
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
      gameStatus = Some("completed"),
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
        request("/puzzles-and-games/progress")
          .withHeaders(Headers("Authorization" -> "Bearer access-token", "Origin" -> allowedOrigin)),
      )

    status(result) should be(OK)
    contentType(result) should contain("application/json")
    header("Access-Control-Allow-Origin", result) should contain(allowedOrigin)
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

  it should "preserve CORS and prevent caching when the progress API fails" in {
    val progressApi = mock[PuzzlesProgressApi]
    when(progressApi.query(any[LocalDate], any[Seq[String]], any[Option[String]])(any[ExecutionContext]))
      .thenReturn(Future.failed(new RuntimeException("API unavailable")))
    val result = controller(successfulProvider, mock[DotcomRenderingService], puzzlesProgressApi = progressApi)
      .puzzlesProgress()(request("/puzzles-and-games/progress").withHeaders(Headers("Origin" -> allowedOrigin)))

    status(result) should be(BAD_GATEWAY)
    header("Access-Control-Allow-Origin", result) should contain(allowedOrigin)
    header("Cache-Control", result) should contain("private, no-store, no-cache")
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
    "v2 only" -> "puzzles-new-hub-v2:variant",
    "v1 control with v2 variant" -> "puzzles-new-hub-v1:control,puzzles-new-hub-v2:variant",
    "absent" -> "",
    "malformed" -> "puzzles-new-hub-v1:,puzzles-new-hub-v1:variant:extra",
    "unknown group" -> "puzzles-new-hub-v1:unknown",
    "unrelated experiment" -> "another-test:variant",
  ).foreach { case (participationCase, participations) =>
    s"puzzles hub access with $participationCase participation" should
      "serve the tag page for HTML and JSON without loading the layout or calling DCR" in {
        val provider = mock[PuzzlesLayoutProvider]
        val renderer = mock[DotcomRenderingService]
        val indexController = mock[IndexController]
        when(indexController.renderItem(eqTo("puzzles-and-games"))(any[RequestHeader]))
          .thenReturn(Future.successful(Results.Ok("tag page")))
        val puzzlesController = controller(provider, renderer, indexController = indexController)

        val htmlResult = puzzlesController.renderPuzzles()(request("/puzzles-and-games", participations))
        val jsonResult = puzzlesController.renderPuzzlesJson()(request("/puzzles-and-games.json", participations))

        status(htmlResult) should be(OK)
        contentAsString(htmlResult) should be("tag page")
        status(jsonResult) should be(OK)
        contentAsString(jsonResult) should be("tag page")
        verify(indexController, times(2)).renderItem(eqTo("puzzles-and-games"))(any[RequestHeader])
        verifyNoInteractions(provider, renderer)
      }
  }

  Seq(
    "",
    "puzzles-new-hub-v1:variant",
    "puzzles-new-hub-v2:variant",
    "puzzles-new-hub-v1:control,puzzles-new-hub-v2:variant",
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:control",
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:unknown",
    "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:variant:extra",
  ).foreach { participations =>
    "Trivia archive access" should s"deny HTML, data and preflights without backend calls: $participations" in {
      val provider = mock[PuzzlesLayoutProvider]
      val renderer = mock[DotcomRenderingService]
      val archiveApi = mock[PuzzlesArchiveApi]
      val gameApi = mock[PuzzlesGameApi]
      val c = controller(provider, renderer, puzzlesArchiveApi = archiveApi, gameApi = gameApi)
      val path = "/puzzles-and-games/trivia-and-quizzes"
      status(c.renderTriviaAndQuizzesArchive()(request(s"$path/archive", participations))) shouldBe NOT_FOUND
      status(c.archiveData("trivia-and-quizzes")(request(s"$path/archive-data", participations))) shouldBe NOT_FOUND
      status(
        c.archiveDataForMonth("trivia-and-quizzes", "film-reveal", 2020, 9)(
          request(s"$path/archive-data/film-reveal/2020/9", participations),
        ),
      ) shouldBe NOT_FOUND
      status(
        c.triviaArchiveDataOptions("film-reveal", 2020, 9)(
          request(s"$path/archive-data/film-reveal/2020/9", participations),
        ),
      ) shouldBe NOT_FOUND
      verifyNoInteractions(provider, renderer, archiveApi, gameApi)
    }
  }

  Seq("film-reveal" -> "FILMREVEAL", "on-the-ball" -> "ONTHEBALL").foreach { case (slug, apiType) =>
    "Trivia archive access" should s"allow $slug HTML and calendar data with both variants" in {
      val items = Seq("film-reveal", "on-the-ball").map { key =>
        PuzzleItem(key, key, key, "all", "primary", slug = Some(s"trivia-and-quizzes/$key"))
      }
      val provider = mock[PuzzlesLayoutProvider]
      when(provider.getLayout()(any[ExecutionContext])).thenReturn(
        Future.successful(
          PuzzlesLayout(
            Seq(
              PuzzleContainer("trivia-and-quizzes", "Trivia & quizzes", content = PuzzleContent(Seq(items), Nil)),
            ),
          ),
        ),
      )
      val renderer = mock[DotcomRenderingService]
      when(renderer.getPuzzlesPage(any[WSClient], any[JsValue])(any[RequestHeader]))
        .thenReturn(Future.successful(Results.Ok("rendered by DCR")))
      val c = controller(provider, renderer)
      val path = "/puzzles-and-games/trivia-and-quizzes"
      val html = c.renderTriviaAndQuizzesArchive()(
        request(s"$path/archive?puzzle=$slug", v2Participations),
      )
      status(html) shouldBe OK
      val payload = ArgumentCaptor.forClass(classOf[JsValue])
      verify(renderer).getPuzzlesPage(any[WSClient], payload.capture())(any[RequestHeader])
      (payload.getValue \ "archive" \ "selectedPuzzle" \ "puzzleType").as[String] shouldBe apiType
      val data = c.archiveDataForMonth("trivia-and-quizzes", slug, 2020, 9)(
        request(s"$path/archive-data/$slug/2020/9", v2Participations),
      )
      status(data) shouldBe OK
      (contentAsJson(data) \ "selectedPuzzle" \ "puzzleType").as[String] shouldBe apiType
      (contentAsJson(data) \ "items" \ 0 \ "url").as[String] shouldBe s"$path/$slug/2020-09-30"
      val options = c.triviaArchiveDataOptions(slug, 2020, 9)(
        request(s"$path/archive-data/$slug/2020/9", v2Participations),
      )
      status(options) shouldBe NO_CONTENT
    }
  }

  Seq(
    ("crosswords", "crossword", "quick"),
    ("word-games", "word-wheel", "all"),
    ("logic-puzzles", "sudoku", "easy"),
  ).foreach { case (category, puzzleType, set) =>
    "Existing archive data" should s"keep $category ungated and remove V2 choices before selecting puzzles" in {
      val item = PuzzleItem("existing-puzzle", "Existing puzzle", puzzleType, set, "primary")
      val choice = item.copy(id = "archive-existing", cardVariant = "archive")
      val film = PuzzleItem("film-reveal", "Film reveal", "film-reveal", "all", "primary")
      val content =
        if (category == "crosswords")
          PuzzleContent(Nil, Nil, archiveChoices = Some(Seq(film.copy(cardVariant = "archive"), choice)))
        else PuzzleContent(Seq(Seq(film, item)), Nil)
      val provider = mock[PuzzlesLayoutProvider]
      when(provider.getLayout()(any[ExecutionContext])).thenReturn(
        Future.successful(
          PuzzlesLayout(
            Seq(
              PuzzleContainer(category, category, content = content),
            ),
          ),
        ),
      )
      val c = controller(provider, mock[DotcomRenderingService])
      val path = s"/puzzles-and-games/$category/archive-data"
      val data = c.archiveData(category)(request(path, participations = ""))
      status(data) shouldBe OK
      (contentAsJson(data) \ "puzzles").as[Seq[JsValue]].map(value => (value \ "id").as[String]) shouldBe
        Seq(if (category == "crosswords") choice.id else item.id)
      val calendar = c.archiveDataForMonth(category, item.id, 2020, 9)(
        request(s"$path/${item.id}/2020/9", participations = ""),
      )
      status(calendar) shouldBe OK
      (contentAsJson(calendar) \ "selectedPuzzle" \ "puzzleType").as[String] should not be "FILMREVEAL"
    }
  }

  /** Existing iframe pages retain v1 access; MovieGrid additionally requires cumulative v2. Crosswords keep their
    * routes.
    */
  private def stubbedPuzzlePageRenderer(): DotcomRenderingService = {
    val renderer = mock[DotcomRenderingService]
    when(renderer.getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader]))
      .thenReturn(Future.successful(Results.Ok("rendered by DCR")))
    renderer
  }

  Seq("hub only", "game only", "both", "different hub edition", "unsponsored edition", "different game group")
    .foreach { scenario =>
      "game sponsorship" should s"resolve $scenario consistently for HTML and JSON" in {
        val gameSponsor = PuzzleSponsor(
          "Game sponsor",
          "Supported by",
          "https://example.com",
          None,
          PuzzleSponsorLogo("https://example.com/logo.png", None, 2.0),
        )
        val hubSponsor = gameSponsor.copy(name = "Hub sponsor")
        val gameConfiguration = Map("word-games" -> Map("AU" -> gameSponsor))
        val sponsoredLayout = scenario match {
          case "hub only"  => layout.copy(sponsorship = Map("AU" -> hubSponsor))
          case "game only" => layout.copy(gameSponsorship = gameConfiguration)
          case "both"      => layout.copy(sponsorship = Map("AU" -> hubSponsor), gameSponsorship = gameConfiguration)
          case "different hub edition" =>
            layout.copy(sponsorship = Map("UK" -> hubSponsor), gameSponsorship = gameConfiguration)
          case "unsponsored edition" => layout.copy(gameSponsorship = gameConfiguration)
          case _                     => layout.copy(gameSponsorship = Map("logic-puzzles" -> Map("AU" -> gameSponsor)))
        }
        val edition = if (scenario == "unsponsored edition") "UK" else "AU"
        val expectedSponsor = scenario match {
          case "both"                                => Some("Hub sponsor")
          case "game only" | "different hub edition" => Some("Game sponsor")
          case _                                     => None
        }
        val provider = successfulProvider
        when(provider.getGameCommercialProperties(eqTo("word-games"))(any[ExecutionContext]))
          .thenReturn(Future.successful(sponsoredLayout.gameCommercialProperties("word-games")))
        val renderer = stubbedPuzzlePageRenderer()
        val puzzlesController = controller(provider, renderer)
        val path = "/puzzles-and-games/word-games/word-wheel/2024-01-15"
        val jsonResult = puzzlesController.renderWordWheelJson("2024-01-15")(request(s"$path.json", edition = edition))
        status(jsonResult) shouldBe OK
        val json = Json.parse(contentAsString(jsonResult))
        (json \ "commercialProperties" \ edition \ "branding" \ "sponsorName").asOpt[String] shouldBe expectedSponsor
        val htmlResult = puzzlesController.renderWordWheel("2024-01-15")(request(path, edition = edition))
        status(htmlResult) shouldBe OK
        val payload = ArgumentCaptor.forClass(classOf[JsValue])
        verify(renderer).getPuzzlePage(any[WSClient], payload.capture())(any[RequestHeader])
        (payload.getValue \ "commercialProperties") shouldBe (json \ "commercialProperties")
      }
    }

  "renderSudoku" should "render a sudoku variant via DCR, using the flattened sudoku-<variant> slug and given date" in {
    val renderer = stubbedPuzzlePageRenderer()

    val result = controller(successfulProvider, renderer)
      .renderSudoku("easy", "2024-01-15")(request("/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15"))

    status(result) should be(OK)
    contentAsString(result) should be("rendered by DCR")
    verify(renderer).getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader])
  }

  it should "resolve the sponsorship category for word wheel, Wordiply and sudoku" in {
    val sponsor = PuzzleSponsor(
      "Word sponsor",
      "Supported by",
      "https://example.com",
      None,
      PuzzleSponsorLogo("https://example.com/logo.png", None, 2.0),
    )
    val sponsoredLayout = layout.copy(gameSponsorship =
      Map(
        "word-games" -> Map("AU" -> sponsor),
        "logic-puzzles" -> Map("AU" -> sponsor.copy(name = "Logic sponsor")),
      ),
    )
    val provider = successfulProvider
    Seq("word-games", "logic-puzzles").foreach { group =>
      when(provider.getGameCommercialProperties(eqTo(group))(any[ExecutionContext]))
        .thenReturn(Future.successful(sponsoredLayout.gameCommercialProperties(group)))
    }
    val puzzlesController = controller(provider, mock[DotcomRenderingService])
    val date = "2024-01-15"
    Seq(
      puzzlesController.renderWordWheelJson(date)(
        request(s"/puzzles-and-games/word-games/word-wheel/$date.json", edition = "AU"),
      ) -> "Word sponsor",
      puzzlesController.renderWordiplyJson(date)(
        request(s"/puzzles-and-games/word-games/wordiply/$date.json", edition = "AU"),
      ) -> "Word sponsor",
      puzzlesController.renderSudokuJson("easy", date)(
        request(s"/puzzles-and-games/logic-puzzles/sudoku-easy/$date.json", edition = "AU"),
      ) -> "Logic sponsor",
    ).foreach { case (result, expectedSponsor) =>
      status(result) shouldBe OK
      (Json.parse(contentAsString(result)) \ "commercialProperties" \ "AU" \ "branding" \ "sponsorName")
        .as[String] shouldBe expectedSponsor
    }
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
    // The page (2024-01-15) is not today's, so every game is recommended as today's, including the one being played.
    val today = LocalDate.now(ZoneId.of("Europe/London"))
    related.map(_.url) should be(
      Seq(
        Some(s"/puzzles-and-games/logic-puzzles/sudoku-killer/$today"),
        Some(s"/puzzles-and-games/logic-puzzles/sudoku-hard/$today"),
        Some(s"/puzzles-and-games/logic-puzzles/sudoku-medium/$today"),
      ),
    )
    related.map(_.cardVariant) should be(Seq("compact", "compact", "compact"))
    related.map(_.cadence) should be(Seq(Some("Today"), Some("Today"), Some("Today")))
    (json \ "instance" \ "puzzlesSupporting" \ "usefulLinks" \\ "title").map(_.as[String]) should be(
      PuzzlesNewsletters.GameLinks.map(_.title),
    )
    (json \ "instance" \ "puzzlesSupporting" \ "newsletter").toOption should be(None)
  }

  it should "include the Cluesletter and the useful links when it is live" in {
    val agent = mock[NewsletterSignupAgent]
    when(agent.getV2NewsletterByName("cluesletter")).thenReturn(
      Right(
        Some(
          NewsletterResponseV2(
            identityName = "cluesletter",
            listId = 6075,
            name = "Cluesletter",
            theme = "lifestyle",
            group = "Culture",
            status = "live",
            restricted = false,
            signUpEmbedDescription = "News and clues",
            signUpDescription = "Long description",
            frequency = "Weekly",
            mailSuccessDescription = None,
            regionFocus = None,
            illustrationCard = None,
            illustrationCircle = None,
            illustrationSquare = None,
            seriesTag = None,
            signupPage = None,
            exampleUrl = None,
            category = "article-based",
            emailConfirmation = false,
          ),
        ),
      ),
    )
    val result = controller(successfulProvider, mock[DotcomRenderingService], newsletterAgent = agent)
      .renderSudokuJson("killer", "2024-01-15")(
        request("/puzzles-and-games/logic-puzzles/sudoku-killer/2024-01-15.json"),
      )

    val supporting = Json.parse(contentAsString(result)) \ "instance" \ "puzzlesSupporting"
    (supporting \ "usefulLinks" \\ "url").map(_.as[String]) should be(PuzzlesNewsletters.GameLinks.map(_.url))
    (supporting \ "newsletter" \ "identityName").as[String] should be("cluesletter")
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
        Some(s"/puzzles-and-games/word-games/word-wheel/${LocalDate.now(ZoneId.of("Europe/London"))}"),
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

  Seq(
    ("film-reveal", "FILMREVEAL", "Film reveal"),
    ("on-the-ball", "ONTHEBALL", "On the ball"),
  ).foreach { case (slug, puzzleType, title) =>
    def jsonAction(c: PuzzlesPageController, date: String) =
      if (slug == "film-reveal") c.renderFilmRevealJson(date) else c.renderOnTheBallJson(date)
    def htmlAction(c: PuzzlesPageController, date: String) =
      if (slug == "film-reveal") c.renderFilmReveal(date) else c.renderOnTheBall(date)
    def archiveAction(c: PuzzlesPageController) =
      if (slug == "film-reveal") c.redirectFilmRevealArchive() else c.redirectOnTheBallArchive()
    val path = s"/puzzles-and-games/trivia-and-quizzes/$slug"
    val date = "2026-09-26"

    slug should "render HTML via the existing puzzle page renderer" in {
      val renderer = stubbedPuzzlePageRenderer()
      val provider = successfulProvider
      val result = htmlAction(controller(provider, renderer), date)(request(s"$path/$date", v2Participations))
      status(result) shouldBe OK
      verify(renderer).getPuzzlePage(any[WSClient], any[JsValue])(any[RequestHeader])
      verify(provider).getGameCommercialProperties(eqTo("trivia-and-quizzes"))(any[ExecutionContext])
    }

    it should "pass the exact API URL and page metadata to DCR without invented progress" in {
      val api = mock[PuzzlesGameApi]
      val gameUrl = s"https://provider.example/play?opaque=$slug&date=$date&token=api-value"
      when(api.get(eqTo(puzzleType), eqTo(LocalDate.parse(date)))(any[ExecutionContext]))
        .thenReturn(Future.successful(Some(PuzzlesApiItem("opaque", puzzleType, date, 0, None, Some(gameUrl)))))
      val provider = successfulProvider
      val result = jsonAction(controller(provider, mock[DotcomRenderingService], gameApi = api), date)(
        request(s"$path/$date.json", v2Participations),
      )
      status(result) shouldBe OK
      val json = contentAsJson(result)
      (json \ "slug").as[String] shouldBe slug
      (json \ "webTitle").as[String] shouldBe title
      (json \ "instance" \ "title").as[String] shouldBe title
      (json \ "instance" \ "puzzleDate").as[String] shouldBe date
      (json \ "instance" \ "gameUrl").as[String] shouldBe gameUrl
      (json \ "instance" \ "gameStatus").toOption shouldBe None
      (json \ "instance" \ "progress").toOption shouldBe None
      (json \ "instance" \ "moreFromPuzzlesAndGames").as[Seq[PuzzleItem]].map(_.id) shouldBe
        Seq(slug, if (slug == "film-reveal") "on-the-ball" else "film-reveal", "crossword-quick")
      verify(api).get(eqTo(puzzleType), eqTo(LocalDate.parse(date)))(any[ExecutionContext])
      verify(provider).getGameCommercialProperties(eqTo("trivia-and-quizzes"))(any[ExecutionContext])
    }

    it should "redirect its bare URL to the selected trivia archive" in {
      val api = mock[PuzzlesGameApi]
      val result = archiveAction(controller(successfulProvider, mock[DotcomRenderingService], gameApi = api))(
        request(path, v2Participations),
      )
      status(result) shouldBe FOUND
      redirectLocation(result) shouldBe Some(s"/puzzles-and-games/trivia-and-quizzes/archive?puzzle=$slug")
      verifyNoInteractions(api)
    }

    it should "require cumulative v2 participation for HTML, JSON and archive redirects" in {
      Seq(
        "",
        "puzzles-new-hub-v1:variant",
        "puzzles-new-hub-v2:variant",
        "puzzles-new-hub-v1:control,puzzles-new-hub-v2:variant",
        "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:control",
        "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:unknown",
        "puzzles-new-hub-v1:variant,puzzles-new-hub-v2:variant:extra",
      ).foreach { participation =>
        val api = mock[PuzzlesGameApi]
        val renderer = mock[DotcomRenderingService]
        val provider = mock[PuzzlesLayoutProvider]
        val archiveApi = mock[PuzzlesArchiveApi]
        val c = controller(provider, renderer, puzzlesArchiveApi = archiveApi, gameApi = api)
        status(htmlAction(c, date)(request(s"$path/$date", participation))) shouldBe NOT_FOUND
        status(jsonAction(c, date)(request(s"$path/$date.json", participation))) shouldBe NOT_FOUND
        status(archiveAction(c)(request(path, participation))) shouldBe NOT_FOUND
        verifyNoInteractions(api, archiveApi, provider, renderer)
      }
    }

    it should "return 404 without a usable API game URL, never falling back to a vendor URL" in {
      Seq(None, Some(""), Some("  ")).foreach { url =>
        val api = mock[PuzzlesGameApi]
        when(api.get(any[String], any[LocalDate])(any[ExecutionContext]))
          .thenReturn(Future.successful(Some(PuzzlesApiItem("opaque", puzzleType, date, 0, None, url))))
        val renderer = mock[DotcomRenderingService]
        status(
          htmlAction(controller(successfulProvider, renderer, gameApi = api), date)(
            request(s"$path/$date", v2Participations),
          ),
        ) shouldBe NOT_FOUND
        verifyNoInteractions(renderer)
      }
    }

    it should "reject invalid dates before contacting the API" in {
      val api = mock[PuzzlesGameApi]
      val c = controller(successfulProvider, mock[DotcomRenderingService], gameApi = api)
      status(jsonAction(c, "2026-02-30")(request(s"$path/2026-02-30.json", v2Participations))) shouldBe NOT_FOUND
      verifyNoInteractions(api)
    }

    it should "return an uncached 502 when the API fails" in {
      val api = mock[PuzzlesGameApi]
      when(api.get(any[String], any[LocalDate])(any[ExecutionContext]))
        .thenReturn(Future.failed(new RuntimeException("private upstream detail")))
      val result = jsonAction(controller(successfulProvider, mock[DotcomRenderingService], gameApi = api), date)(
        request(s"$path/$date.json", v2Participations),
      )
      status(result) shouldBe BAD_GATEWAY
      header("Cache-Control", result).get should include("no-cache")
      contentAsString(result) should not include "private upstream detail"
    }
  }

  "Puzzle game lookup" should "map every supported slug to its API type and forward the returned URL" in {
    PuzzlesPageController.PuzzleTypesBySlug.foreach { case (slug, puzzleType) =>
      val api = mock[PuzzlesGameApi]
      val date = LocalDate.of(2026, 9, 26)
      val gameUrl = "https://tg.amuselabs.com/guardian/date-picker?id=opaque-id&set=from-api&embed=1"
      when(api.get(eqTo(puzzleType), eqTo(date))(any[ExecutionContext]))
        .thenReturn(
          Future.successful(Some(PuzzlesApiItem("opaque-id", puzzleType, date.toString, 0, None, Some(gameUrl)))),
        )
      val c = controller(successfulProvider, mock[DotcomRenderingService], gameApi = api)
      val action = slug match {
        case "word-wheel"  => c.renderWordWheelJson(date.toString)
        case "wordiply"    => c.renderWordiplyJson(date.toString)
        case "film-reveal" => c.renderFilmRevealJson(date.toString)
        case "on-the-ball" => c.renderOnTheBallJson(date.toString)
        case _             => c.renderSudokuJson(slug.stripPrefix("sudoku-"), date.toString)
      }
      val result = action(request(s"/puzzles-and-games/test/$slug/$date.json", v2Participations))
      status(result) shouldBe OK
      (contentAsJson(result) \ "instance" \ "gameUrl").as[String] shouldBe gameUrl
      verify(api).get(eqTo(puzzleType), eqTo(date))(any[ExecutionContext])
    }
  }

  it should "return 404 for a missing game or a game without a playable URL" in {
    Seq(None, Some(PuzzlesApiItem("id", "WORDWHEEL", "2026-09-26", 0, None, None))).foreach { game =>
      val api = mock[PuzzlesGameApi]
      when(api.get(any[String], any[LocalDate])(any[ExecutionContext])).thenReturn(Future.successful(game))
      val renderer = mock[DotcomRenderingService]
      val result = controller(successfulProvider, renderer, gameApi = api)
        .renderWordWheel("2026-09-26")(request("/puzzles-and-games/word-games/word-wheel/2026-09-26"))
      status(result) shouldBe NOT_FOUND
      verifyNoInteractions(renderer)
    }
  }

  it should "reject impossible dates before calling the API" in {
    val api = mock[PuzzlesGameApi]
    val result = controller(successfulProvider, mock[DotcomRenderingService], gameApi = api)
      .renderWordWheelJson("2026-02-30")(request("/puzzles-and-games/word-games/word-wheel/2026-02-30.json"))
    status(result) shouldBe NOT_FOUND
    verifyNoInteractions(api)
  }

  it should "return an uncached 502 when game lookup fails" in {
    val api = mock[PuzzlesGameApi]
    when(api.get(any[String], any[LocalDate])(any[ExecutionContext]))
      .thenReturn(Future.failed(new RuntimeException("secret")))
    val result = controller(successfulProvider, mock[DotcomRenderingService], gameApi = api)
      .renderWordWheelJson("2026-09-26")(request("/puzzles-and-games/word-games/word-wheel/2026-09-26.json"))
    status(result) shouldBe BAD_GATEWAY
    contentAsString(result) should not include "secret"
    header("Cache-Control", result).get should include("no-cache")
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
