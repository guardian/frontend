package controllers

import ab.PuzzlesHubExperiment
import common.ImplicitControllerExecutionContext
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader
import model.dotcomrendering.{
  DotcomPuzzlePageRenderingDataModel,
  DotcomPuzzlesPageRenderingDataModel,
  PuzzleItem,
  PuzzlePageInstance,
}
import model.{ApplicationContext, CacheTime, Cached}
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

  def renderCrosswordsArchive(): Action[AnyContent] = renderArchive("crosswords")
  def renderWordGamesArchive(): Action[AnyContent] = renderArchive("word-games")
  def renderLogicPuzzlesArchive(): Action[AnyContent] = renderArchive("logic-puzzles")

  private def renderArchive(category: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isV1Enabled || request.getRequestFormat != HtmlFormat) notFound
      else
        buildArchive(category)
          .flatMap { case (layout, archive) =>
            val page = StaticPages.dcrSimplePuzzlesArchivePage(request.path, archive.title, archive.description)
            val renderingData = DotcomPuzzlesPageRenderingDataModel.archive(page, layout, archive, request)
            remoteRenderer.getPuzzlesPage(wsClient, DotcomPuzzlesPageRenderingDataModel.toJson(renderingData))
          }
          .recoverWith { case _: NoSuchElementException => notFound }
    }

  def archiveData(): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesHubExperiment.isV1Enabled) notFound
      else
        request.getQueryString("category") match {
          case Some(category) =>
            buildArchive(category)
              .map { case (_, archive) =>
                Ok(Json.toJson(archive)).withHeaders(CACHE_CONTROL -> "private, max-age=60")
              }
              .recoverWith { case _: NoSuchElementException => notFound }
          case None => notFound
        }
    }

  private def selectedMonth(request: RequestHeader): YearMonth = {
    val current = YearMonth.from(LocalDate.now(ZoneId.of("Europe/London")))
    val requested = for {
      year <- request.getQueryString("year").flatMap(value => Try(value.toInt).toOption)
      month <- request.getQueryString("month").flatMap(value => Try(value.toInt).toOption)
      value <- Try(YearMonth.of(year, month)).toOption
    } yield value
    requested.getOrElse(current)
  }

  private def buildArchive(category: String)(implicit
      request: RequestHeader,
  ): Future[(model.dotcomrendering.PuzzlesLayout, model.dotcomrendering.PuzzlesArchive)] = {
    val yearMonth = selectedMonth(request)
    puzzlesLayoutProvider.getLayout().flatMap { layout =>
      PuzzlesArchiveBuilder.select(layout, category, request.getQueryString("puzzle")) match {
        case None => Future.failed(new NoSuchElementException(s"Unknown puzzles archive category: $category"))
        case Some(selection) =>
          val dataUrl =
            s"/puzzles-and-games/archive-data?category=$category&puzzle=${selection.puzzle.id}"
          puzzlesArchiveApi
            .get(yearMonth.atDay(1), yearMonth.atEndOfMonth(), selection.apiType)
            .map(items =>
              layout -> PuzzlesArchiveBuilder.build(
                selection,
                layout,
                yearMonth.getYear,
                yearMonth.getMonthValue,
                items,
                dataUrl,
                hasError = false,
              ),
            )
            .recover { case _ =>
              layout -> PuzzlesArchiveBuilder.build(
                selection,
                layout,
                yearMonth.getYear,
                yearMonth.getMonthValue,
                Nil,
                dataUrl,
                hasError = true,
              )
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
    val instance = PuzzlePageInstance(
      title = webTitle,
      puzzleId = request.getQueryString("puzzleId"),
      puzzleDate = Some(date),
      moreFromPuzzlesAndGames = PuzzlesPageController.moreFromPuzzlesAndGames(slug, date),
    )
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

  /** Static metadata for a single "more from Puzzles & Games" recommendation card. `group` is `None` for crosswords,
    * whose destination is a fixed series page rather than a group/slug/date Puzzle Page route.
    */
  private case class RelatedPuzzleMeta(
      id: String,
      title: String,
      `type`: String,
      set: String,
      group: Option[String],
      image: String,
      imageAlt: String,
      backgroundColour: String,
  )

  /** Curated catalogue of "more from" recommendation cards, keyed by the same slug used by this game's own Puzzle Page
    * route. Image/colour values reuse the same real assets already used for these puzzles on the Puzzles Hub (see
    * `applications/conf/puzzles-layout.json`), for visual consistency.
    */
  private val relatedPuzzleCatalogue: Map[String, RelatedPuzzleMeta] = Map(
    "sudoku-easy" -> RelatedPuzzleMeta(
      id = "sudoku-easy",
      title = "Easy sudoku",
      `type` = "sudoku",
      set = "easy",
      group = Some(LogicPuzzlesGroup),
      image = "https://i.guim.co.uk/img/uploads/2026/09/15/logic-puzzles-SUDOKU-EASY.png?width=440&dpr=2&s=none",
      imageAlt = "Easy sudoku illustration",
      backgroundColour = "#CDECFB",
    ),
    "sudoku-medium" -> RelatedPuzzleMeta(
      id = "sudoku-medium",
      title = "Medium sudoku",
      `type` = "sudoku",
      set = "medium",
      group = Some(LogicPuzzlesGroup),
      image = "https://i.guim.co.uk/img/uploads/2026/09/15/logic-puzzles-SUDOKU-MEDIUM.png?width=440&dpr=2&s=none",
      imageAlt = "Medium sudoku illustration",
      backgroundColour = "#CDECFB",
    ),
    "sudoku-hard" -> RelatedPuzzleMeta(
      id = "sudoku-hard",
      title = "Hard sudoku",
      `type` = "sudoku",
      set = "hard",
      group = Some(LogicPuzzlesGroup),
      image = "https://i.guim.co.uk/img/uploads/2026/09/15/logic-puzzles-SUDOKU-HARD.png?width=440&dpr=2&s=none",
      imageAlt = "Hard sudoku illustration",
      backgroundColour = "#CDECFB",
    ),
    "sudoku-killer" -> RelatedPuzzleMeta(
      id = "sudoku-killer",
      title = "Killer sudoku",
      `type` = "sudoku",
      set = "killer",
      group = Some(LogicPuzzlesGroup),
      image = "https://i.guim.co.uk/img/uploads/2026/09/15/logic-puzzles-SUDOKU-KILLER.png?width=440&dpr=2&s=none",
      imageAlt = "Killer sudoku illustration",
      backgroundColour = "#CDECFB",
    ),
    WordWheelSlug -> RelatedPuzzleMeta(
      id = WordWheelSlug,
      title = "Word wheel",
      `type` = "word-wheel",
      set = "all",
      group = Some(WordGamesGroup),
      image = "https://i.guim.co.uk/img/uploads/2026/09/15/word-games-WORD-WHEEL.png?width=440&dpr=2&s=none",
      imageAlt = "Word wheel illustration",
      backgroundColour = "#F9D4E8",
    ),
    WordiplySlug -> RelatedPuzzleMeta(
      id = WordiplySlug,
      title = "Wordiply",
      `type` = "wordiply",
      set = "all",
      group = Some(WordGamesGroup),
      image = "https://i.guim.co.uk/img/uploads/2026/09/15/word-games-WORDIPLY.png?width=440&dpr=2&s=none",
      imageAlt = "Wordiply illustration",
      backgroundColour = "#F8D0C9",
    ),
    "crossword-quick" -> RelatedPuzzleMeta(
      id = "crossword-quick",
      title = "Quick crossword",
      `type` = "crossword",
      set = "quick",
      group = None,
      image = "https://i.guim.co.uk/img/uploads/2026/09/15/crossword-QUICK.png?width=440&dpr=2&s=none",
      imageAlt = "Quick crossword illustration",
      backgroundColour = "#FCE1CE",
    ),
  )

  /** Which other puzzles to recommend from each of this game's own Puzzle Page: one from each of the other Puzzles &
    * Games categories (excluding this game's own), confirmed with product. Crosswords are represented by the quick
    * crossword's existing `/crosswords/series/quick` tag/series page (an existing, already-live route - not a specific
    * day's crossword article, which would require an extra CAPI lookup this page doesn't otherwise need).
    */
  private val relatedSlugs: Map[String, Seq[String]] = Map(
    "sudoku-easy" -> Seq("sudoku-medium", WordWheelSlug, "crossword-quick"),
    "sudoku-medium" -> Seq("sudoku-hard", WordiplySlug, "crossword-quick"),
    "sudoku-hard" -> Seq("sudoku-killer", WordWheelSlug, "crossword-quick"),
    "sudoku-killer" -> Seq("sudoku-easy", WordiplySlug, "crossword-quick"),
    WordWheelSlug -> Seq("sudoku-easy", WordiplySlug, "crossword-quick"),
    WordiplySlug -> Seq("sudoku-medium", WordWheelSlug, "crossword-quick"),
  )

  /** Builds the "more from Puzzles & Games" recommendation cards for a given Puzzle Page instance. Each recommended
    * puzzle links to that puzzle's own page for the same `date` (except the crossword card, which links to its fixed
    * series page). Reuses the Puzzles Hub's own `PuzzleItem` card shape (see `PuzzlesLayout.scala`) so DCR's
    * `isPuzzleItem` validation (id/title/type/set/cardVariant/cadence) is satisfied without inventing a new shape.
    */
  def moreFromPuzzlesAndGames(slug: String, date: String): Seq[PuzzleItem] =
    relatedSlugs.getOrElse(slug, Nil).flatMap(relatedPuzzleCatalogue.get).map { meta =>
      val url = meta.group match {
        case Some(group) => s"/puzzles-and-games/$group/${meta.id}/$date"
        case None        => "/crosswords/series/quick"
      }
      PuzzleItem(
        id = meta.id,
        title = meta.title,
        `type` = meta.`type`,
        set = meta.set,
        cardVariant = "compact",
        cadence = Some("Daily"),
        url = Some(url),
        image = Some(meta.image),
        imageAlt = Some(meta.imageAlt),
        backgroundColour = Some(meta.backgroundColour),
      )
    }
}
