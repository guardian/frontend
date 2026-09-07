package model.dotcomrendering

import common.{CanonicalLink, Edition}
import model.{CrosswordData, Page}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, OWrites}
import play.api.mvc.RequestHeader

/** Best-effort "more from puzzles and games" recommendation, sent to DCR's `/GamePage` endpoint. This is
  * additional, isolated data used only by the new Game Page flow (see GamePageController) and does not affect the
  * existing crossword article rendering.
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

/** Per-instance data for a single Game Page. `crosswordData`/`discussionId` are only populated when the page's slug
  * is "crossword" - for the other (iframe-based) game slugs, DCR's own static registry owns all structural/rendering
  * behaviour and this repo only needs to provide a reasonable title.
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

/** Rendering data model for the new, isolated Game Page flow (POST to DCR's `/GamePage` endpoint). This
  * generalizes today's single crossword article page to all Guardian puzzle/game types. It is entirely additive
  * and separate from the existing `DotcomRenderingDataModel.forCrossword` flow used by the crossword routes.
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
