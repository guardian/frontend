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

  /** Puzzle Page: a generic page template for iframe-based puzzle types (sudoku, word games, etc), rendered by DCR via
    * its `/PuzzlePage` endpoint. There is no per-instance content to fetch for any of these - the iframe always shows
    * "today's" puzzle according to the third party's own logic - so this repo only needs to provide a reasonable static
    * title per slug. All structural rendering (iframe URL, flags) is resolved by DCR's own static registry, keyed by
    * slug. See docs/puzzle-page.md for the full reference.
    *
    * Deliberately named distinctly from `renderPuzzles`/`renderPuzzlesJson` above (the unrelated Puzzles Hub/listing
    * page) - `renderPuzzlePage(Json)` serves a single puzzle instance, not the hub.
    *
    * Note: crosswords are explicitly out of scope for Puzzle Page - they remain on their own, separate crossword-only
    * routes/controllers, untouched.
    */
  def renderPuzzlePage(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      slug match {
        case puzzleSlug if PuzzlesPageController.puzzleSlugTitles.contains(puzzleSlug) =>
          renderPuzzlePageContent(puzzleSlug)
        case _ => notFound
      }
    }

  def renderPuzzlePageJson(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      slug match {
        case puzzleSlug if PuzzlesPageController.puzzleSlugTitles.contains(puzzleSlug) =>
          renderPuzzlePageContentJson(puzzleSlug)
        case _ => notFound
      }
    }

  private def renderPuzzlePageContent(slug: String)(implicit request: RequestHeader): Future[Result] = {
    val dataModel = buildPuzzlePageData(slug)
    remoteRenderer.getPuzzlePage(wsClient, DotcomPuzzlePageRenderingDataModel.toJson(dataModel))
  }

  private def renderPuzzlePageContentJson(slug: String)(implicit request: RequestHeader): Future[Result] = {
    val dataModel = buildPuzzlePageData(slug)
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
  )(implicit request: RequestHeader): DotcomPuzzlePageRenderingDataModel = {
    val webTitle = PuzzlesPageController.puzzleSlugTitles(slug)
    val page = StaticPages.dcrSimplePuzzlePage(request.path, webTitle)
    val instance = PuzzlePageInstance(title = webTitle)
    DotcomPuzzlePageRenderingDataModel(page, slug, webTitle, instance, request)
  }
}

object PuzzlesPageController {

  /** The 6 currently-live, iframe-based Puzzle Page slugs (V0 scope, matching DCR's own registry), and a reasonable
    * static title for each. DCR's own static registry, keyed by slug, owns the iframe URL and all other
    * structural/rendering behaviour - this repo does not need to know or send any of that.
    */
  val puzzleSlugTitles: Map[String, String] = Map(
    "sudoku-easy" -> "Sudoku (easy)",
    "sudoku-medium" -> "Sudoku (medium)",
    "sudoku-hard" -> "Sudoku (hard)",
    "sudoku-killer" -> "Killer sudoku",
    "word-wheel" -> "Word wheel",
    "wordiply" -> "Wordiply",
  )
}
