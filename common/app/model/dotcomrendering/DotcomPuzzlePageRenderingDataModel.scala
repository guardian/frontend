package model.dotcomrendering

import common.{CanonicalLink, Edition}
import model.{CrosswordData, Page}
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

/** Per-instance data for a single Puzzle Page. Puzzle Page is currently scoped to iframe-based puzzles only (see
  * PuzzlesPageController), which only ever populate `title` - `puzzleType`/`setterName`/`date`/
  * `specialInstructions`/`discussionId`/`crosswordData` were added for a crossword-flavoured Puzzle Page slug that has
  * since been descoped (crosswords remain on their own, separate crossword-only flow). These fields are kept here,
  * always `None`/unpopulated, only because they are part of the JSON contract already agreed with DCR's `/PuzzlePage`
  * endpoint - removing them is a DCR-side contract change to coordinate separately, not something to do unilaterally
  * from this repo.
  */
case class PuzzlePageInstance(
    title: String,
    puzzleType: Option[String] = None,
    setterName: Option[String] = None,
    date: Option[String] = None,
    specialInstructions: Option[String] = None,
    discussionId: Option[String] = None,
    crosswordData: Option[CrosswordData] = None,
    moreFromPuzzlesAndGames: Seq[MoreFromPuzzlesAndGamesItem] = Nil,
)

object PuzzlePageInstance {
  implicit val writes: OWrites[PuzzlePageInstance] = Json.writes[PuzzlePageInstance]
}

/** Rendering data model for the Puzzle Page flow (POST to DCR's `/PuzzlePage` endpoint), currently scoped to
  * iframe-based puzzle types only. It is entirely additive and separate from the existing crossword article rendering
  * flow (`DotcomRenderingDataModel.forCrossword`) used by the crossword-only routes.
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
