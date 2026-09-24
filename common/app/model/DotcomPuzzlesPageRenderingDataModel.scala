package model.dotcomrendering

import common.commercial.EditionCommercialProperties
import common.{CanonicalLink, Edition}
import conf.Configuration
import model.SimplePage
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, OWrites}
import play.api.mvc.RequestHeader

case class DotcomPuzzlesPageRenderingDataModel(
    id: String,
    editionId: String,
    editionLongForm: String,
    contributionsServiceUrl: String,
    webTitle: String,
    description: Option[String],
    config: JsObject,
    nav: Nav,
    pageFooter: PageFooter,
    commercialProperties: Map[String, EditionCommercialProperties],
    isAdFreeUser: Boolean,
    canonicalUrl: String,
    layout: PuzzlesLayout,
    archive: Option[PuzzlesArchive] = None,
)

case class PuzzlesArchivePuzzle(
    id: String,
    title: String,
    puzzleType: String,
    slug: Option[String],
    set: String,
)

object PuzzlesArchivePuzzle {
  implicit val writes: OWrites[PuzzlesArchivePuzzle] = Json.writes[PuzzlesArchivePuzzle]
}

case class PuzzlesArchiveItem(
    puzzleId: String,
    puzzleType: String,
    date: String,
    progress: Int,
    setterName: Option[String],
    url: String,
)

object PuzzlesArchiveItem {
  implicit val writes: OWrites[PuzzlesArchiveItem] = Json.writes[PuzzlesArchiveItem]
}

case class PuzzlesArchive(
    category: String,
    title: String,
    description: String,
    selectedPuzzle: PuzzlesArchivePuzzle,
    puzzles: Seq[PuzzlesArchivePuzzle],
    year: Int,
    month: Int,
    items: Seq[PuzzlesArchiveItem],
    dataUrl: String,
    hasError: Boolean,
    moreFrom: Seq[PuzzleItem],
)

object PuzzlesArchive {
  implicit val writes: OWrites[PuzzlesArchive] = Json.writes[PuzzlesArchive]
}

object DotcomPuzzlesPageRenderingDataModel {
  implicit val writes: OWrites[DotcomPuzzlesPageRenderingDataModel] =
    Json.writes[DotcomPuzzlesPageRenderingDataModel]

  def apply(
      page: SimplePage,
      layout: PuzzlesLayout,
      request: RequestHeader,
  ): DotcomPuzzlesPageRenderingDataModel = {
    val edition = Edition.edition(request)
    val commercialProperties = page.metadata.commercial
      .map(_.perEdition.map { case (key, value) => key.id -> value })
      .getOrElse(Map.empty)

    DotcomPuzzlesPageRenderingDataModel(
      id = page.metadata.id,
      editionId = edition.id,
      editionLongForm = edition.displayName,
      contributionsServiceUrl = Configuration.contributionsService.url,
      webTitle = page.metadata.webTitle,
      description = page.metadata.description,
      config = DotcomRenderingConfig(page, request, isPreview = false),
      nav = Nav(page, edition, request, customSubnav = None),
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
      commercialProperties = commercialProperties,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
      layout = layout,
      archive = None,
    )
  }

  def archive(
      page: SimplePage,
      layout: PuzzlesLayout,
      archive: PuzzlesArchive,
      request: RequestHeader,
  ): DotcomPuzzlesPageRenderingDataModel =
    apply(page, layout, request).copy(archive = Some(archive))

  def toJson(model: DotcomPuzzlesPageRenderingDataModel): JsValue =
    DotcomRenderingUtils.withoutNull(Json.toJson(model))
}
