package controllers

import contentapi.ContentApiClient
import crosswords.CrosswordPageWithContent
import model.dotcomrendering.{DotcomGamePageRenderingDataModel, GamePageInstance}
import model.{ApplicationContext, CacheTime, Cached, CrosswordContent, CrosswordData, GUDateTimeFormatNew}
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import staticpages.StaticPages

import scala.concurrent.Future

/** Controller for the new, isolated "Game Page" flow: a generalization of today's crossword article page to all
  * Guardian puzzle/game types. This is entirely additive and separate from `CrosswordsController`/
  * `CrosswordPageController` and the existing crossword routes, which this controller does not touch or call into (it
  * reuses the `CrosswordController` trait's CAPI-fetching helpers, unmodified, rather than duplicating them).
  *
  * Note: this flow is not currently gated behind any AB test - it was previously gated behind a `game-page-experiment`
  * server-side AB test, but that gate was removed at the user's explicit request (see docs/puzzles-game-page-plan.md)
  * since these routes are expected to be mapped/exposed via a separate project instead.
  */
class GamePageController(
    val contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    val wsClient: WSClient,
    override val remoteRenderer: DotcomRenderingService,
)(implicit context: ApplicationContext)
    extends CrosswordController {

  def noResults()(implicit request: RequestHeader): Result =
    Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound))

  private def notFound(implicit request: RequestHeader): Future[Result] = Future.successful(noResults())

  /** Only the 11 iframe-based slugs are served from here - the "crossword" slug has its own dedicated,
    * path-segment-based route/actions below (`renderCrossword`/`renderCrosswordJson`), exactly like the existing
    * `/crosswords/{type}/{id}` routes, rather than query params (query params on unrecognised names are rejected
    * outright in local dev by `DevParametersHttpRequestHandler`, and wouldn't survive the CDN in prod either).
    */
  def renderGame(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      slug match {
        case iframeSlug if GamePageController.iframeSlugTitles.contains(iframeSlug) =>
          renderIframeGamePage(iframeSlug)
        case _ => notFound
      }
    }

  def renderGameJson(slug: String): Action[AnyContent] =
    Action.async { implicit request =>
      slug match {
        case iframeSlug if GamePageController.iframeSlugTitles.contains(iframeSlug) =>
          renderIframeGamePageJson(iframeSlug)
        case _ => notFound
      }
    }

  /** For the "crossword" slug we fetch a real example crossword from CAPI, exactly like the existing
    * `/crosswords/{type}/{id}` flow does today, by reusing `CrosswordController.withCrossword` (defined in
    * CrosswordsController.scala, left unmodified). `crosswordType`/`id` are path segments, mirroring the existing
    * crossword routes, rather than query params - see docs/puzzles-game-page-plan.md for manual validation examples.
    */
  def renderCrossword(crosswordType: String, id: Int): Action[AnyContent] =
    Action.async { implicit request =>
      renderCrosswordGamePage(crosswordType, id)
    }

  def renderCrosswordJson(crosswordType: String, id: Int): Action[AnyContent] =
    Action.async { implicit request =>
      renderCrosswordGamePage(crosswordType, id, asJson = true)
    }

  /** For the iframe-based slugs there is no per-instance CAPI content to fetch - the iframe always shows "today's"
    * puzzle according to the third party's own logic - so we only need a reasonable static title. All structural
    * rendering (iframe URL, flags) is resolved by DCR's own static registry, keyed by slug.
    */
  private def renderIframeGamePage(slug: String)(implicit request: RequestHeader): Future[Result] = {
    val dataModel = buildIframeGamePageData(slug)
    remoteRenderer.getGamePage(wsClient, DotcomGamePageRenderingDataModel.toJson(dataModel))
  }

  private def renderIframeGamePageJson(slug: String)(implicit request: RequestHeader): Future[Result] = {
    val dataModel = buildIframeGamePageData(slug)
    Future.successful(
      Cached(CacheTime.NotFound)(
        Cached.WithoutRevalidationResult(Ok(DotcomGamePageRenderingDataModel.toJson(dataModel)).as("application/json")),
      ),
    )
  }

  private def buildIframeGamePageData(
      slug: String,
  )(implicit request: RequestHeader): DotcomGamePageRenderingDataModel = {
    val webTitle = GamePageController.iframeSlugTitles(slug)
    val page = StaticPages.dcrSimpleGamePage(request.path, webTitle)
    val instance = GamePageInstance(title = webTitle)
    DotcomGamePageRenderingDataModel(page, slug, webTitle, instance, request)
  }

  private def renderCrosswordGamePage(crosswordType: String, id: Int, asJson: Boolean = false)(implicit
      request: RequestHeader,
  ): Future[Result] = {
    withCrossword(crosswordType, id) { (crossword, content) =>
      val crosswordData = CrosswordData.fromCrossword(crossword, content)
      val crosswordContent = CrosswordContent.make(crosswordData, content)
      val page = new CrosswordPageWithContent(crosswordContent)

      val instance = GamePageInstance(
        title = content.webTitle,
        puzzleType = Some(crosswordType),
        setterName = crosswordData.creator.map(_.name),
        date = Some(GUDateTimeFormatNew.formatDateForDisplay(crosswordData.webPublicationDate, request)),
        specialInstructions = crosswordData.instructions,
        discussionId = crosswordContent.content.discussionId,
        crosswordData = Some(crosswordData),
      )

      val dataModel = DotcomGamePageRenderingDataModel(
        page,
        GamePageController.CrosswordSlug,
        content.webTitle,
        instance,
        request,
      )
      val json = DotcomGamePageRenderingDataModel.toJson(dataModel)

      if (asJson)
        Future.successful(
          Cached(CacheTime.NotFound)(
            Cached.WithoutRevalidationResult(Ok(json).as("application/json")),
          ),
        )
      else remoteRenderer.getGamePage(wsClient, json)
    }
  }
}

object GamePageController {
  val CrosswordSlug = "crossword"

  /** The 11 currently-live, iframe-based (non-CAPI) game slugs, and a reasonable static title for each. DCR's own
    * static registry, keyed by slug, owns the iframe URL and all other structural/rendering behaviour - this repo does
    * not need to know or send any of that.
    */
  val iframeSlugTitles: Map[String, String] = Map(
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
