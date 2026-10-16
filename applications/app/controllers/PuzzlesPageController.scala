package controllers

import ab.PuzzlesHubV1Experiment
import common.ImplicitControllerExecutionContext
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.dotcomrendering.{
  DotcomPuzzlePageRenderingDataModel,
  DotcomPuzzlesPageRenderingDataModel,
  PuzzlePageInstance,
}
import model.{ApplicationContext, CacheTime, Cached, Cors, NoCache, TinyResponse}
import play.api.libs.ws.WSClient
import play.api.libs.json.Json
import play.api.mvc._
import renderers.DotcomRenderingService
import staticpages.StaticPages

import java.time.{LocalDate, YearMonth, ZoneId}
import scala.concurrent.Future
import scala.util.Try
import scala.util.control.NonFatal

class PuzzlesPageController(
    wsClient: WSClient,
    puzzlesLayoutProvider: PuzzlesLayoutProvider,
    puzzlesArchiveApi: PuzzlesArchiveApi,
    puzzlesProgressApi: PuzzlesProgressApi,
    remoteRenderer: DotcomRenderingService,
    puzzlesGameApi: PuzzlesGameApi,
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
        .map(items => Ok(Json.toJson(PuzzlesApiResponse(items))))
        .recover { case _ => BadGateway(Json.obj("message" -> "Failed to retrieve puzzle progress")) }
        .map(result => Cors(NoCache(result)))
    }

  def puzzlesDataOptions(): Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("GET, OPTIONS"))
  }

  def archiveDataOptions(puzzle: String, year: Int, month: Int): Action[AnyContent] = puzzlesDataOptions()

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
      val result = Try(YearMonth.of(year, month)).toOption match {
        case None                 => Future.successful(BadRequest)
        case Some(requestedMonth) =>
          buildArchive(
            category,
            Some(puzzle),
            Some(requestedMonth),
            request.headers.get("Authorization"),
          )
            .map { case (_, archive) =>
              Ok(Json.toJson(archive))
            }
            .recoverWith { case _: NoSuchElementException => notFound }
      }
      result.map(response => Cors(NoCache(response)))
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
              PuzzleRecommendations.apiLookup(puzzlesArchiveApi),
            )
            .flatMap { moreFrom =>
              val calendarItems = puzzlesArchiveApi.get(startDate, endDate, selection.apiType, authorization)
              // Recent cards are relative to today, not the calendar's selected month.
              // Reuse the current month's request, which already includes a 31-day lookback.
              val recentItems =
                if (isCurrentMonth) calendarItems
                else puzzlesArchiveApi.get(today.minusDays(31), today, selection.apiType, authorization)

              calendarItems
                .zip(recentItems.recover { case _ => Nil })
                .map { case (items, recent) =>
                  layout -> PuzzlesArchiveBuilder.build(
                    selection,
                    yearMonth.getYear,
                    yearMonth.getMonthValue,
                    items,
                    hasError = false,
                    moreFrom = moreFrom,
                    recentItems = Some(recent),
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

  /** Iframe puzzle pages resolve their slug and URL date through GET /game. Crosswords retain their own routes. */
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
    withPuzzlePageData(slug, webTitle, date) { dataModel =>
      remoteRenderer.getPuzzlePage(wsClient, DotcomPuzzlePageRenderingDataModel.toJson(dataModel))
    }
  }

  private def renderPuzzlePageContentJson(
      slug: String,
      webTitle: String,
      date: String,
  )(implicit request: RequestHeader): Future[Result] =
    withPuzzlePageData(slug, webTitle, date) { dataModel =>
      Future.successful(
        Cached(CacheTime.NotFound)(
          Cached.WithoutRevalidationResult(
            Ok(DotcomPuzzlePageRenderingDataModel.toJson(dataModel)).as("application/json"),
          ),
        ),
      )
    }

  private def withPuzzlePageData(slug: String, webTitle: String, date: String)(
      render: DotcomPuzzlePageRenderingDataModel => Future[Result],
  )(implicit request: RequestHeader): Future[Result] = {
    val selection = for {
      puzzleType <- PuzzlesPageController.PuzzleTypesBySlug.get(slug)
      parsedDate <- Try(LocalDate.parse(date)).toOption
    } yield puzzleType -> parsedDate

    selection match {
      case None                           => notFound
      case Some((puzzleType, parsedDate)) =>
        puzzlesGameApi
          .get(puzzleType, parsedDate)
          .flatMap {
            case Some(game) if game.gameUrl.exists(_.trim.nonEmpty) =>
              PuzzleRecommendations
                .resolve(slug, currentId = None, date, PuzzleRecommendations.apiLookup(puzzlesArchiveApi))
                .flatMap { recommendations =>
                  val page = StaticPages.dcrSimplePuzzlePage(request.path, webTitle)
                  val instance = PuzzlePageInstance(
                    title = webTitle,
                    puzzleDate = Some(date),
                    gameUrl = game.gameUrl,
                    moreFromPuzzlesAndGames = recommendations,
                    puzzlesSupporting = puzzlesNewsletters.forGame(usefulLinks = Seq.empty),
                  )
                  render(DotcomPuzzlePageRenderingDataModel(page, slug, webTitle, instance, request))
                }
            case _ => notFound
          }
          .recover { case NonFatal(_) => NoCache(BadGateway("Failed to retrieve puzzle")) }
    }
  }

}

object PuzzlesPageController {

  val PuzzleTypesBySlug: Map[String, String] = Map(
    "sudoku-easy" -> "SUDOKU_EASY",
    "sudoku-medium" -> "SUDOKU_MEDIUM",
    "sudoku-hard" -> "SUDOKU_HARD",
    "sudoku-killer" -> "SUDOKU_KILLER",
    "word-wheel" -> "WORDWHEEL",
    "wordiply" -> "WORDIPLY",
  )

  val ProgressPuzzleTypes: Seq[String] = Seq(
    "CROSSWORD_GENIUS",
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
