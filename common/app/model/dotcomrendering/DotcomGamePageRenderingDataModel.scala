package model.dotcomrendering

import common.{CanonicalLink, Edition}
import model.{CrosswordData, Page}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, OWrites}
import play.api.mvc.RequestHeader

/** Best-effort "more from puzzles and games" recommendation, sent to DCR's `/GamePage` endpoint. This is additional,
  * isolated data used only by the Game Page flow (see PuzzlesPageController) and does not affect the existing crossword
  * article rendering.
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

/** Per-instance data for a single Game Page. Game Page is currently scoped to iframe-based games only (see
  * PuzzlesPageController), which only ever populate `title` - `puzzleType`/`setterName`/`date`/
  * `specialInstructions`/`discussionId`/`crosswordData` were added for a crossword-flavoured Game Page slug that has
  * since been descoped (crosswords remain on their own, separate crossword-only flow). These fields are kept here,
  * always `None`/unpopulated, only because they are part of the JSON contract already agreed with DCR's `/GamePage`
  * endpoint - removing them is a DCR-side contract change to coordinate separately, not something to do unilaterally
  * from this repo.
  */
case class GamePageInstance(
    title: String,
    puzzleType: Option[String] = None,
    setterName: Option[String] = None,
    date: Option[String] = None,
    specialInstructions: Option[String] = None,
    discussionId: Option[String] = None,
    crosswordData: Option[CrosswordData] = None,
    moreFromPuzzlesAndGames: Seq[MoreFromPuzzlesAndGamesItem] = Nil,
)

object GamePageInstance {
  implicit val writes: OWrites[GamePageInstance] = Json.writes[GamePageInstance]
}

/** Rendering data model for the Game Page flow (POST to DCR's `/GamePage` endpoint), currently scoped to iframe-based
  * puzzle/game types only. It is entirely additive and separate from the existing crossword article rendering flow
  * (`DotcomRenderingDataModel.forCrossword`) used by the crossword-only routes.
  */
case class DotcomGamePageRenderingDataModel(
    id: String,
    slug: String,
    webTitle: String,
    config: JsObject,
    nav: Nav,
    pageFooter: PageFooter,
    canonicalUrl: String,
    editionId: String,
    instance: GamePageInstance,
)

object DotcomGamePageRenderingDataModel {
  implicit val writes: OWrites[DotcomGamePageRenderingDataModel] = Json.writes[DotcomGamePageRenderingDataModel]

  def apply(
      page: Page,
      slug: String,
      webTitle: String,
      instance: GamePageInstance,
      request: RequestHeader,
  ): DotcomGamePageRenderingDataModel = {
    val edition = Edition.edition(request)

    DotcomGamePageRenderingDataModel(
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

  def toJson(model: DotcomGamePageRenderingDataModel): JsValue =
    DotcomRenderingUtils.withoutNull(Json.toJson(model))
}
