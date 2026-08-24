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
)

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
      nav = Nav(page, edition),
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
      commercialProperties = commercialProperties,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
      layout = layout,
    )
  }

  def toJson(model: DotcomPuzzlesPageRenderingDataModel): JsValue =
    DotcomRenderingUtils.withoutNull(Json.toJson(model))
}
