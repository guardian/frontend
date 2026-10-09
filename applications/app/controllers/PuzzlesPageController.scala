package controllers

import ab.PuzzlesHubV1Experiment
import common.ImplicitControllerExecutionContext
import contentapi.ContentApiClient
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.dotcomrendering.{
  DotcomPuzzlePageRenderingDataModel,
  DotcomPuzzlesPageRenderingDataModel,
  PuzzlePageInstance,
}
import model.{ApplicationContext, CacheTime, Cached, NoCache}
import play.api.libs.ws.WSClient
import play.api.libs.json.Json
import play.api.mvc._
import renderers.DotcomRenderingService
import staticpages.StaticPages

import java.time.{LocalDate, YearMonth, ZoneId}
import scala.concurrent.Future
import scala.util.Try

class PuzzlesPageController(
    wsClient: WSClient,
    puzzlesLayoutProvider: PuzzlesLayoutProvider,
    puzzlesArchiveApi: PuzzlesArchiveApi,
    puzzlesProgressApi: PuzzlesProgressApi,
    remoteRenderer: DotcomRenderingService,
    contentApiClient: ContentApiClient,
    puzzlesNewsletters: PuzzlesNewsletters,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext {

  private def notFound(implicit request: RequestHeader): Future[Result] =
    Future.successful(
      Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)),
    )

  def renderPuzzles(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else
        request.getRequestFormat match {
          case HtmlFormat =>
            val page = StaticPages.dcrSimplePuzzlesPage(request.path)

            puzzlesLayoutProvider.getLayout().flatMap { layout =>
              val renderingData = DotcomPuzzlesPageRenderingDataModel(page, layout, request)
              remoteRenderer.getPuzzlesPage(
                wsClient,
                DotcomPuzzlesPageRenderingDataModel.toJson(renderingData),
              )
            }

          case _ => notFound
        }
    }

  def renderPuzzlesJson(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else
        request.getRequestFormat match {
          case JsonFormat =>
            val page = StaticPages.dcrSimplePuzzlesPage(request.path)

            puzzlesLayoutProvider.getLayout().map { layout =>
              val renderingData = DotcomPuzzlesPageRenderingDataModel(page, layout, request)
              common
                .renderJson(DotcomPuzzlesPageRenderingDataModel.toJson(renderingData), page)
                .as("application/json")
            }

          case _ => notFound
        }
    }

  def puzzlesProgress(): Action[AnyContent] =
    Action.async { implicit request =>
      val today = LocalDate.now(ZoneId.of("Europe/London"))
      puzzlesProgressApi
        .query(
          today,
          PuzzlesPageController.ProgressPuzzleTypes,
          request.headers.get("Authorization"),
        )
        .map(items => NoCache(Ok(Json.toJson(PuzzlesApiResponse(items)))))
        .recover { case _ => NoCache(BadGateway(Json.obj("message" -> "Failed to retrieve puzzle progress"))) }
    }

  def renderCrosswordsArchive(): Action[AnyContent] = renderArchive("crosswords")
  def renderWordGamesArchive(): Action[AnyContent] = renderArchive("word-games")
  def renderLogicPuzzlesArchive(): Action[AnyContent] = renderArchive("logic-puzzles")

  private def renderArchive(category: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled || request.getRequestFormat != HtmlFormat) notFound
      else
        buildArchive(category)
          .flatMap { case (layout, archive) =>
            val page = StaticPages.dcrSimplePuzzlesArchivePage(request.path, archive.title, archive.description)
            val renderingData = DotcomPuzzlesPageRenderingDataModel.archive(page, layout, archive, request)
            remoteRenderer.getPuzzlesPage(wsClient, DotcomPuzzlesPageRenderingDataModel.toJson(renderingData))
          }
          .recoverWith { case _: NoSuchElementException => notFound }
    }

  def archiveData(category: String): Action[AnyContent] =
    Action.async { implicit request =>
      buildArchive(category, authorization = request.headers.get("Authorization"))
        .map { case (_, archive) =>
          NoCache(Ok(Json.toJson(archive)))
        }
        .recoverWith { case _: NoSuchElementException => notFound }
    }

  // Fastly strips unrecognised query parameters. Calendar requests must carry
  // their selection in the path so that CODE/PROD receive the requested month.
  def archiveDataForMonth(category: String, puzzle: String, year: Int, month: Int): Action[AnyContent] =
    Action.async { implicit request =>
      Try(YearMonth.of(year, month)).toOption match {
        case None                 => Future.successful(BadRequest)
        case Some(requestedMonth) =>
          buildArchive(
            category,
            Some(puzzle),
            Some(requestedMonth),
            request.headers.get("Authorization"),
          )
            .map { case (_, archive) =>
              NoCache(Ok(Json.toJson(archive)))
            }
            .recoverWith { case _: NoSuchElementException => notFound }
      }
    }

  private def selectedMonth(request: RequestHeader, today: LocalDate): YearMonth = {
    val current = YearMonth.from(today)
    val requested = for {
      year <- request.getQueryString("year").flatMap(value => Try(value.toInt).toOption)
      month <- request.getQueryString("month").flatMap(value => Try(value.toInt).toOption)
      value <- Try(YearMonth.of(year, month)).toOption
    } yield value
    requested.filterNot(_.isAfter(current)).getOrElse(current)
  }

  private def buildArchive(
      category: String,
      puzzle: Option[String] = None,
      requestedMonth: Option[YearMonth] = None,
      authorization: Option[String] = None,
  )(implicit
      request: RequestHeader,
  ): Future[(model.dotcomrendering.PuzzlesLayout, model.dotcomrendering.PuzzlesArchive)] = {
    val today = LocalDate.now(ZoneId.of("Europe/London"))
    val yearMonth = requestedMonth
      .map(month => if (month.isAfter(YearMonth.from(today))) YearMonth.from(today) else month)
      .getOrElse(selectedMonth(request, today))

    val isCurrentMonth = yearMonth == YearMonth.from(today)
    val startDate = if (isCurrentMonth) today.minusDays(31) else yearMonth.atDay(1)
    val endDate = if (isCurrentMonth) today else yearMonth.atEndOfMonth()

    puzzlesLayoutProvider.getLayout().flatMap { layout =>
      PuzzlesArchiveBuilder.select(
        layout,
        category,
        puzzle.orElse(request.getQueryString("puzzle")),
      ) match {
        case None =>
          Future.failed(
            new NoSuchElementException(
              s"Unknown puzzles archive category: $category",
            ),
          )

        case Some(selection) =>
          PuzzleRecommendations
            .resolveForArchive(
              PuzzlesArchiveBuilder.relatedPuzzleKey(selection),
              today.toString,
              PuzzleRecommendations.capiLookup(contentApiClient),
            )
            .flatMap { moreFrom =>
              puzzlesArchiveApi
                .get(
                  startDate,
                  endDate,
                  selection.apiType,
                  authorization,
                )
                .map { items =>
                  layout -> PuzzlesArchiveBuilder.build(
                    selection,
                    yearMonth.getYear,
                    yearMonth.getMonthValue,
                    items,
                    hasError = false,
                    moreFrom = moreFrom,
                  )
                }
                .recover { case _ =>
                  layout -> PuzzlesArchiveBuilder.build(
                    selection,
                    yearMonth.getYear,
                    yearMonth.getMonthValue,
                    Nil,
                    hasError = true,
                    moreFrom = moreFrom,
                  )
                }
            }
      }
    }
  }

  /** Puzzle Page: a generic page template for iframe-based puzzle types, rendered by DCR via its `/PuzzlePage`
    * endpoint. There is no per-instance content to fetch for any of these - the iframe always shows the puzzle for the
    * requested date according to the third party's own logic - so this repo only needs to provide a reasonable static
    * title plus that date. All structural rendering (iframe URL, flags) is resolved by DCR's own static registry, keyed
    * by slug. See docs/puzzle-page.md for the full reference.
    *
    * Public URLs are nested under `/puzzles-and-games/{group}/{game}/{date}`, where `{group}` is each game's DCR
    * `puzzleGroup` ("logic-puzzles" or "word-games") as a literal, hardcoded path segment on that game's own dedicated
    * route/action - not a generic `:group` wildcard - consistent with each game having its own explicit route/action
    * below (mirroring how the crossword controller handles each crossword type explicitly, rather than a single generic
    * slug/group action).
    *
    * `{date}` is a real, always-present `yyyy-MM-dd` path segment (format-validated at the route level via a
    * `$date<\d{4}-\d{2}-\d{2}>` constraint, so a malformed date 404s before reaching this controller at all - deeper
    * calendar validity, e.g. rejecting a real Feb 30 or future dates, is intentionally not implemented, see
    * docs/puzzle-page.md). The bare, dateless URL for each game redirects (temporarily - a real archive page doesn't
    * exist yet) to that group's not-yet-built archive page, filtered to this puzzle via a `?puzzle=` query param.
    *
    * Sudoku takes a `variant` path segment (`renderSudoku`/`renderSudokuJson`, e.g. `.../sudoku-easy/2024-01-15`); word
    * wheel and wordiply each have their own dedicated actions taking only `date` (their slug/title/group are hardcoded
    * internally). All are deliberately named distinctly from `renderPuzzles`/`renderPuzzlesJson` above (the unrelated
    * Puzzles Hub/listing page).
    *
    * Gated behind the same `PuzzlesHubV1Experiment` ("puzzles-new-hub-v1") AB test already used by the hub actions
    * above - reusing the existing experiment rather than introducing a new one.
    *
    * Note: crosswords are explicitly out of scope for Puzzle Page - they remain on their own, separate crossword-only
    * routes/controllers, untouched.
    */
  def renderSudoku(variant: String, date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else if (PuzzlesPageController.SudokuVariants.contains(variant))
        renderPuzzlePageContent(s"sudoku-$variant", PuzzlesPageController.sudokuTitle(variant), date)
      else notFound
    }

  def renderSudokuJson(variant: String, date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else if (PuzzlesPageController.SudokuVariants.contains(variant))
        renderPuzzlePageContentJson(s"sudoku-$variant", PuzzlesPageController.sudokuTitle(variant), date)
      else notFound
    }

  def redirectSudokuArchive(variant: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else if (PuzzlesPageController.SudokuVariants.contains(variant))
        redirectToArchive(PuzzlesPageController.LogicPuzzlesGroup, s"sudoku-$variant")
      else notFound
    }

  def renderWordWheel(date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else renderPuzzlePageContent(PuzzlesPageController.WordWheelSlug, "Word wheel", date)
    }

  def renderWordWheelJson(date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else renderPuzzlePageContentJson(PuzzlesPageController.WordWheelSlug, "Word wheel", date)
    }

  def redirectWordWheelArchive(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else redirectToArchive(PuzzlesPageController.WordGamesGroup, PuzzlesPageController.WordWheelSlug)
    }

  def renderWordiply(date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else renderPuzzlePageContent(PuzzlesPageController.WordiplySlug, "Wordiply", date)
    }

  def renderWordiplyJson(date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else renderPuzzlePageContentJson(PuzzlesPageController.WordiplySlug, "Wordiply", date)
    }

  def redirectWordiplyArchive(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubV1Experiment.isEnabled) notFound
      else redirectToArchive(PuzzlesPageController.WordGamesGroup, PuzzlesPageController.WordiplySlug)
    }

  /** Temporary (302) redirect to `group`'s archive page, filtered to `slug`. The archive page itself doesn't exist yet
    * (a V1 feature), so this will 404 downstream until it's built - that's an accepted, explicitly confirmed
    * limitation. A temporary (not permanent) redirect is used deliberately, so browsers/caches don't lock in a redirect
    * target that doesn't exist yet.
    */
  private def redirectToArchive(group: String, slug: String)(implicit request: RequestHeader): Future[Result] =
    Future.successful(
      Redirect(s"/puzzles-and-games/$group/archive", Map("puzzle" -> Seq(slug)), status = FOUND),
    )

  private def renderPuzzlePageContent(
      slug: String,
      webTitle: String,
      date: String,
  )(implicit request: RequestHeader): Future[Result] = {
    buildPuzzlePageData(slug, webTitle, date).flatMap { dataModel =>
      remoteRenderer.getPuzzlePage(wsClient, DotcomPuzzlePageRenderingDataModel.toJson(dataModel))
    }
  }

  private def renderPuzzlePageContentJson(
      slug: String,
      webTitle: String,
      date: String,
  )(implicit request: RequestHeader): Future[Result] = {
    buildPuzzlePageData(slug, webTitle, date).map { dataModel =>
      Cached(CacheTime.NotFound)(
        Cached.WithoutRevalidationResult(
          Ok(DotcomPuzzlePageRenderingDataModel.toJson(dataModel)).as("application/json"),
        ),
      )
    }
  }

  private def buildPuzzlePageData(
      slug: String,
      webTitle: String,
      date: String,
  )(implicit request: RequestHeader): Future[DotcomPuzzlePageRenderingDataModel] =
    PuzzleRecommendations
      .resolve(slug, currentId = None, date, PuzzleRecommendations.capiLookup(contentApiClient))
      .map { moreFromPuzzlesAndGames =>
        val page = StaticPages.dcrSimplePuzzlePage(request.path, webTitle)
        val instance = PuzzlePageInstance(
          title = webTitle,
          puzzleDate = Some(date),
          moreFromPuzzlesAndGames = moreFromPuzzlesAndGames,
          puzzlesSupporting = puzzlesNewsletters.forGame(usefulLinks = Seq.empty),
        )
        DotcomPuzzlePageRenderingDataModel(page, slug, webTitle, instance, request)
      }
}

object PuzzlesPageController {

  val ProgressPuzzleTypes: Seq[String] = Seq(
    "CROSSWORD_QUICK",
    "CROSSWORD_MINI",
    "CROSSWORD_CRYPTIC",
    "CROSSWORD_QUICKCRYPTIC",
    "CROSSWORD_WEEKEND",
    "CROSSWORD_PRIZE",
    "CROSSWORD_QUIPTIC",
    "CROSSWORD_SUNDAYQUICK",
    "SUDOKU_EASY",
    "SUDOKU_MEDIUM",
    "SUDOKU_HARD",
    "SUDOKU_KILLER",
    "WORDWHEEL",
    "WORDIPLY",
  )

  val LogicPuzzlesGroup = "logic-puzzles"
  val WordGamesGroup = "word-games"

  /** Accepted sudoku variants for the `/puzzles-and-games/logic-puzzles/sudoku-:variant/:date` route. Play's route
    * regex (`$variant<easy|medium|hard|killer>`) already constrains this at the HTTP layer, but this is re-checked here
    * too since the controller's actions are also exercised directly (bypassing routing) by unit tests, and to guard
    * against this action ever being wired up to a less-constrained route in future.
    */
  val SudokuVariants: Set[String] = Set("easy", "medium", "hard", "killer")

  /** Display title for a sudoku variant. Kept minimal and derived (rather than a curated per-variant map) since DCR
    * owns the canonical puzzle titles in its own `puzzleConfigs.ts` registry; this repo only needs a reasonable,
    * always-correct string for `webTitle` (share-button text) and `instance.title` (the page's rendered heading).
    */
  def sudokuTitle(variant: String): String =
    if (variant == "killer") "Killer sudoku" else s"Sudoku ($variant)"

  val WordWheelSlug = "word-wheel"
  val WordiplySlug = "wordiply"
}
