package controllers

import ab.PuzzlesHubExperiment
import common.ImplicitControllerExecutionContext
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.dotcomrendering.{DotcomGamePageRenderingDataModel, DotcomPuzzlesPageRenderingDataModel, GamePageInstance}
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

  /** Game Page: a generic page template for iframe-based puzzle/game types (sudoku, word games, quizzes/trivia, etc),
    * rendered by DCR via its `/GamePage` endpoint. There is no per-instance content to fetch for any of these - the
    * iframe always shows "today's" puzzle according to the third party's own logic - so this repo only needs to provide
    * a reasonable static title per slug. All structural rendering (iframe URL, flags) is resolved by DCR's own static
    * registry, keyed by slug. See docs/game-page.md for the full reference.
    *
    * Note: crosswords are explicitly out of scope for Game Page - they remain on their own, separate separate
    * crossword-only routes/controllers, untouched.
    */
  def renderGame(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      slug match {
        case gameSlug if PuzzlesPageController.gameSlugTitles.contains(gameSlug) => renderGamePage(gameSlug)
        case _                                                                   => notFound
      }
    }

  def renderGameJson(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      slug match {
        case gameSlug if PuzzlesPageController.gameSlugTitles.contains(gameSlug) => renderGamePageJson(gameSlug)
        case _                                                                   => notFound
      }
    }

  private def renderGamePage(slug: String)(implicit request: RequestHeader): Future[Result] = {
    val dataModel = buildGamePageData(slug)
    remoteRenderer.getGamePage(wsClient, DotcomGamePageRenderingDataModel.toJson(dataModel))
  }

  private def renderGamePageJson(slug: String)(implicit request: RequestHeader): Future[Result] = {
    val dataModel = buildGamePageData(slug)
    Future.successful(
      Cached(CacheTime.NotFound)(
        Cached.WithoutRevalidationResult(Ok(DotcomGamePageRenderingDataModel.toJson(dataModel)).as("application/json")),
      ),
    )
  }

  private def buildGamePageData(slug: String)(implicit request: RequestHeader): DotcomGamePageRenderingDataModel = {
    val webTitle = PuzzlesPageController.gameSlugTitles(slug)
    val page = StaticPages.dcrSimpleGamePage(request.path, webTitle)
    val instance = GamePageInstance(title = webTitle)
    DotcomGamePageRenderingDataModel(page, slug, webTitle, instance, request)
  }
}

object PuzzlesPageController {

  /** The 11 currently-live, iframe-based Game Page slugs, and a reasonable static title for each. DCR's own static
    * registry, keyed by slug, owns the iframe URL and all other structural/rendering behaviour - this repo does not
    * need to know or send any of that.
    */
  val gameSlugTitles: Map[String, String] = Map(
    "sudoku-easy" -> "Sudoku (easy)",
    "sudoku-medium" -> "Sudoku (medium)",
    "sudoku-hard" -> "Sudoku (hard)",
    "sudoku-killer" -> "Killer sudoku",
    "futoshiki" -> "Futoshiki",
    "suguru" -> "Suguru",
    "word-wheel" -> "Word wheel",
    "codeword" -> "Codeword",
    "wordiply" -> "Wordiply",
    "on-the-ball" -> "On the ball",
    "film-reveal" -> "Film reveal",
  )
}
