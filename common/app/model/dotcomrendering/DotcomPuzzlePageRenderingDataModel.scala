package model.dotcomrendering

import common.{CanonicalLink, Edition}
import model.Page
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, OWrites}
import play.api.mvc.RequestHeader

/** Best-effort "more from puzzles and games" recommendation, sent to DCR's `/PuzzlePage` endpoint. This is additional,
  * isolated data used only by the Puzzle Page flow (see PuzzlesPageController) and does not affect the existing
  * crossword article rendering.
  */
case class MoreFromPuzzlesAndGamesItem(
    title: String,
    `type`: String,
    set: String,
    url: Option[String] = None,
)

object MoreFromPuzzlesAndGamesItem {
  implicit val writes: OWrites[MoreFromPuzzlesAndGamesItem] = Json.writes[MoreFromPuzzlesAndGamesItem]
}

/** Per-instance data for a single Puzzle Page. Puzzle Page is scoped to iframe-based puzzles only (see
  * PuzzlesPageController) - there is no crossword (or other component-rendered) case, so this type carries no
  * crossword-specific fields. (A set of crossword-flavoured fields - `puzzleType`/`setterName`/`date`/
  * `specialInstructions`/`discussionId`/`crosswordData` - existed here briefly during early development of a since-
  * descoped crossword-flavoured Puzzle Page slug, and were removed once that scope was confirmed permanently out, as a
  * coordinated contract change with DCR's equivalent removal.)
  */
case class PuzzlePageInstance(
    title: String,
    /** The puzzle date to show, as an ISO-8601 (`yyyy-MM-dd`) date string - which day's puzzle this instance is for.
      * Always populated by `PuzzlesPageController` directly from the request URL's date path segment (e.g.
      * `/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15`); modelled as optional for JSON forwards/backwards
      * compatibility. DCR is being updated in parallel to display this value and forward it to the puzzle iframe.
      */
    puzzleDate: Option[String] = None,
    moreFromPuzzlesAndGames: Seq[MoreFromPuzzlesAndGamesItem] = Nil,
)

object PuzzlePageInstance {
  implicit val writes: OWrites[PuzzlePageInstance] = Json.writes[PuzzlePageInstance]
}

/** Rendering data model for the Puzzle Page flow (POST to DCR's `/PuzzlePage` endpoint), scoped to iframe-based puzzle
  * types only. It is entirely additive and separate from the existing crossword article rendering flow
  * (`DotcomRenderingDataModel.forCrossword`) used by the crossword-only routes.
  */
case class DotcomPuzzlePageRenderingDataModel(
    id: String,
    slug: String,
    webTitle: String,
    config: JsObject,
    nav: Nav,
    pageFooter: PageFooter,
    canonicalUrl: String,
    editionId: String,
    instance: PuzzlePageInstance,
    /** Whether the requesting reader has paid for an ad-free subscription, mirroring the same field already sent on the
      * sibling Puzzles Hub contract (`DotcomPuzzlesPageRenderingDataModel.isAdFreeUser`) and on every other DCR page
      * type this repo posts to. DCR's `PuzzlePageLayout` now reads this to gate every ad slot
      * (`canRenderAds(puzzlePage)`) instead of always rendering ads regardless of the reader's ad-free status - a real
      * gap this field closes, coordinated with that DCR-side change.
      */
    isAdFreeUser: Boolean,
)

object DotcomPuzzlePageRenderingDataModel {
  implicit val writes: OWrites[DotcomPuzzlePageRenderingDataModel] = Json.writes[DotcomPuzzlePageRenderingDataModel]

  def apply(
      page: Page,
      slug: String,
      webTitle: String,
      instance: PuzzlePageInstance,
      request: RequestHeader,
  ): DotcomPuzzlePageRenderingDataModel = {
    val edition = Edition.edition(request)

    DotcomPuzzlePageRenderingDataModel(
      id = page.metadata.id,
      slug = slug,
      webTitle = webTitle,
      config = DotcomRenderingConfig(page, request, isPreview = false),
      nav = Nav(page, edition, request, customSubnav = None),
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
      editionId = edition.id,
      instance = instance,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
    )
  }

  def toJson(model: DotcomPuzzlePageRenderingDataModel): JsValue =
    DotcomRenderingUtils.withoutNull(Json.toJson(model))
}
