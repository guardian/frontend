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

import java.time.LocalDate
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
    * endpoint. There is no per-instance content to fetch for any of these - the iframe always shows "today's" puzzle
    * according to the third party's own logic - so this repo only needs to provide a reasonable static title. All
    * structural rendering (iframe URL, flags) is resolved by DCR's own static registry, keyed by slug. See
    * docs/puzzle-page.md for the full reference.
    *
    * Public URLs are top-level (no `/puzzles-and-games` prefix), mirroring exactly how crosswords already work
    * (`/crosswords/{type}/{id}`, also unprefixed) - crosswords can't be restructured, so the other puzzle types follow
    * the same top-level, nested-by-type convention for consistency, only the hub page itself lives at
    * `/puzzles-and-games`.
    *
    * Each game gets its own explicit, dedicated action(s), mirroring how the crossword controller handles each
    * crossword type explicitly via a constrained `$crosswordType<...>` route rather than a single generic slug action
    *   - Play routing isn't well suited to a single "generic slug" action once URLs diverge structurally by game.
    *     Sudoku takes a `variant` path segment (`renderSudoku`/`renderSudokuJson`, e.g. `/sudoku/easy`); word wheel and
    *     wordiply each have their own no-argument actions (`renderWordWheel`/`renderWordWheelJson`,
    *     `renderWordiply`/`renderWordiplyJson`) hardcoding their own slug/title internally, exactly like a dedicated
    *     crossword-type action would. All are deliberately named distinctly from `renderPuzzles`/`renderPuzzlesJson`
    *     above (the unrelated Puzzles Hub/listing page).
    *
    * Gated behind the same `PuzzlesHubExperiment` ("puzzles-new-hub") AB test already used by the hub actions above -
    * reusing the existing experiment rather than introducing a new one for V0.
    *
    * Note: crosswords are explicitly out of scope for Puzzle Page - they remain on their own, separate crossword-only
    * routes/controllers, untouched.
    */
  def renderSudoku(variant: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else
        PuzzlesPageController.sudokuVariantTitles.get(variant) match {
          case Some(webTitle) => renderPuzzlePageContent(s"sudoku-$variant", webTitle)
          case None           => notFound
        }
    }

  def renderSudokuJson(variant: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else
        PuzzlesPageController.sudokuVariantTitles.get(variant) match {
          case Some(webTitle) => renderPuzzlePageContentJson(s"sudoku-$variant", webTitle)
          case None           => notFound
        }
    }

  def renderWordWheel(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else renderPuzzlePageContent(PuzzlesPageController.WordWheelSlug, PuzzlesPageController.WordWheelTitle)
    }

  def renderWordWheelJson(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else renderPuzzlePageContentJson(PuzzlesPageController.WordWheelSlug, PuzzlesPageController.WordWheelTitle)
    }

  def renderWordiply(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else renderPuzzlePageContent(PuzzlesPageController.WordiplySlug, PuzzlesPageController.WordiplyTitle)
    }

  def renderWordiplyJson(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isEnabled) notFound
      else renderPuzzlePageContentJson(PuzzlesPageController.WordiplySlug, PuzzlesPageController.WordiplyTitle)
    }

  private def renderPuzzlePageContent(
      slug: String,
      webTitle: String,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = buildPuzzlePageData(slug, webTitle)
    remoteRenderer.getPuzzlePage(wsClient, DotcomPuzzlePageRenderingDataModel.toJson(dataModel))
  }

  private def renderPuzzlePageContentJson(
      slug: String,
      webTitle: String,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = buildPuzzlePageData(slug, webTitle)
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
  )(implicit request: RequestHeader): DotcomPuzzlePageRenderingDataModel = {
    val page = StaticPages.dcrSimplePuzzlePage(request.path, webTitle)
    val instance = PuzzlePageInstance(title = webTitle, puzzleDate = Some(resolvePuzzleDate))
    DotcomPuzzlePageRenderingDataModel(page, slug, webTitle, instance, request)
  }

  /** The puzzle date to show, as an ISO-8601 (`yyyy-MM-dd`) date string. Prep for V1 calendar navigation (per PR review
    * feedback: users will eventually navigate to a specific past date's puzzle rather than always "today's"). Accepted
    * as an optional `?date=` query param - not a path segment, to avoid disrupting the URL shapes above - defaulting to
    * today's date when absent, which preserves current behaviour exactly. This is pure plumbing for V0: no calendar UI
    * is being built now, and DCR is not expected to act on this value yet.
    */
  private def resolvePuzzleDate(implicit request: RequestHeader): String =
    request.getQueryString("date").getOrElse(LocalDate.now().toString)
}

object PuzzlesPageController {

  /** Sudoku variant -> display title, for the `/sudoku/:variant` route. */
  val sudokuVariantTitles: Map[String, String] = Map(
    "easy" -> "Sudoku (easy)",
    "medium" -> "Sudoku (medium)",
    "hard" -> "Sudoku (hard)",
    "killer" -> "Killer sudoku",
  )

  val WordWheelSlug = "word-wheel"
  val WordWheelTitle = "Word wheel"

  val WordiplySlug = "wordiply"
  val WordiplyTitle = "Wordiply"
}
