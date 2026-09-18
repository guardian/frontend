package controllers

import ab.PuzzlesHubExperiment
import common.ImplicitControllerExecutionContext
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.dotcomrendering.{
  DotcomPuzzlePageRenderingDataModel,
  DotcomPuzzlesPageRenderingDataModel,
  PuzzlePageInstance,
}
import model.{ApplicationContext, CacheTime, Cached}
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import staticpages.StaticPages

import scala.concurrent.Future

class PuzzlesPageController(
    wsClient: WSClient,
    puzzlesLayoutProvider: PuzzlesLayoutProvider,
    remoteRenderer: DotcomRenderingService,
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
      if (!PuzzlesHubExperiment.isEnabled) notFound
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
      if (!PuzzlesHubExperiment.isEnabled) notFound
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
    * Gated behind the same `PuzzlesHubExperiment` ("puzzles-new-hub") AB test already used by the hub actions above -
    * reusing the existing experiment rather than introducing a new one for V0.
    *
    * Note: crosswords are explicitly out of scope for Puzzle Page - they remain on their own, separate crossword-only
    * routes/controllers, untouched.
    */
  def renderSudoku(variant: String, date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else if (PuzzlesPageController.SudokuVariants.contains(variant))
        renderPuzzlePageContent(s"sudoku-$variant", PuzzlesPageController.sudokuTitle(variant), date)
      else notFound
    }

  def renderSudokuJson(variant: String, date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else if (PuzzlesPageController.SudokuVariants.contains(variant))
        renderPuzzlePageContentJson(s"sudoku-$variant", PuzzlesPageController.sudokuTitle(variant), date)
      else notFound
    }

  def redirectSudokuArchive(variant: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else if (PuzzlesPageController.SudokuVariants.contains(variant))
        redirectToArchive(PuzzlesPageController.LogicPuzzlesGroup, s"sudoku-$variant")
      else notFound
    }

  def renderWordWheel(date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else renderPuzzlePageContent(PuzzlesPageController.WordWheelSlug, "Word wheel", date)
    }

  def renderWordWheelJson(date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else renderPuzzlePageContentJson(PuzzlesPageController.WordWheelSlug, "Word wheel", date)
    }

  def redirectWordWheelArchive(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else redirectToArchive(PuzzlesPageController.WordGamesGroup, PuzzlesPageController.WordWheelSlug)
    }

  def renderWordiply(date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else renderPuzzlePageContent(PuzzlesPageController.WordiplySlug, "Wordiply", date)
    }

  def renderWordiplyJson(date: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else renderPuzzlePageContentJson(PuzzlesPageController.WordiplySlug, "Wordiply", date)
    }

  def redirectWordiplyArchive(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
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
    val dataModel = buildPuzzlePageData(slug, webTitle, date)
    remoteRenderer.getPuzzlePage(wsClient, DotcomPuzzlePageRenderingDataModel.toJson(dataModel))
  }

  private def renderPuzzlePageContentJson(
      slug: String,
      webTitle: String,
      date: String,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = buildPuzzlePageData(slug, webTitle, date)
    Future.successful(
      Cached(CacheTime.NotFound)(
        Cached.WithoutRevalidationResult(
          Ok(DotcomPuzzlePageRenderingDataModel.toJson(dataModel)).as("application/json"),
        ),
      ),
    )
  }

  private def buildPuzzlePageData(
      slug: String,
      webTitle: String,
      date: String,
  )(implicit request: RequestHeader): DotcomPuzzlePageRenderingDataModel = {
    val page = StaticPages.dcrSimplePuzzlePage(request.path, webTitle)
    val instance = PuzzlePageInstance(title = webTitle, puzzleDate = Some(date))
    DotcomPuzzlePageRenderingDataModel(page, slug, webTitle, instance, request)
  }
}

object PuzzlesPageController {

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
