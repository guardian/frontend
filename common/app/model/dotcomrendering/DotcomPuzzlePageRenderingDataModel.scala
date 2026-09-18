package model.dotcomrendering

import common.{CanonicalLink, Edition}
import model.Page
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, OWrites}
import play.api.mvc.RequestHeader

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
    /** Best-effort "more from puzzles and games" recommendations: one related puzzle from each of the other Puzzles &
      * Games categories (excluding this instance's own game), populated by `PuzzlesPageController`. Reuses the same
      * `PuzzleItem` shape already used by the (unrelated) Puzzles Hub feature (see `PuzzlesLayout.scala`), rather than
      * a bespoke type, since DCR's rail consumes the same card fields (id/title/type/set/url/image/etc). DCR gates
      * actually rendering this rail behind the `puzzles-new-hub-v1` tier (a v1-scoped feature, see
      * docs/puzzle-page.md), so it's safe/expected for this to be populated ahead of that tier shipping.
      */
    moreFromPuzzlesAndGames: Seq[PuzzleItem] = Nil,
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
    )
  }

  def toJson(model: DotcomPuzzlePageRenderingDataModel): JsValue =
    DotcomRenderingUtils.withoutNull(Json.toJson(model))
}
