package model.dotcomrendering

import common.{CanonicalLink, Edition}
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import conf.Configuration
import model.{PressedPage, RelatedContentItem}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, OWrites}
import play.api.mvc.RequestHeader

case class DotcomFrontsRenderingDataModel(
    pressedPage: PressedPage,
    nav: Nav,
    editionId: String,
    editionLongForm: String,
    guardianBaseURL: String,
    pageId: String,
    webTitle: String,
    webURL: String,
    config: JsObject,
    commercialProperties: Map[String, EditionCommercialProperties],
    pageFooter: PageFooter,
    isAdFreeUser: Boolean,
    isNetworkFront: Boolean,
    mostViewed: Seq[Trail],
    deeplyRead: Option[Seq[Trail]],
    contributionsServiceUrl: String,
    canonicalUrl: String,
)

object DotcomFrontsRenderingDataModel {
  implicit val writes: OWrites[DotcomFrontsRenderingDataModel] = Json.writes[DotcomFrontsRenderingDataModel]

  def apply(
      page: PressedPage,
      request: RequestHeader,
      pageType: PageType,
      mostViewed: Seq[RelatedContentItem],
      deeplyRead: Option[Seq[Trail]],
  ): DotcomFrontsRenderingDataModel = {
    val edition = Edition.edition(request)
    val nav = Nav(page, edition)

    val combinedConfig = DotcomRenderingConfig(
      page = page,
      request = request,
      isPreview = pageType.isPreview,
    )

    val commercialProperties = page.metadata.commercial
      .map { _.perEdition.mapKeys(_.id) }
      .getOrElse(Map.empty[String, EditionCommercialProperties])

    val lighterPage = page.copy(collections =
      page.collections.map(collection =>
        collection.copy(
          curated = collection.curated.map(content => content.withoutCommercial),
          backfill = collection.backfill.map(content => content.withoutCommercial),
        ),
      ),
    )

    DotcomFrontsRenderingDataModel(
      pressedPage = lighterPage,
      nav = nav,
      editionId = edition.id,
      editionLongForm = edition.displayName,
      guardianBaseURL = Configuration.site.host,
      pageId = page.metadata.id,
      webTitle = page.metadata.webTitle,
      webURL = page.metadata.webUrl,
      config = combinedConfig,
      commercialProperties = commercialProperties,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(Edition(request))),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      isNetworkFront = page.isNetworkFront,
      mostViewed = mostViewed.map(content => Trail.pressedContentToTrail(content.faciaContent)(request)),
      deeplyRead = deeplyRead,
      contributionsServiceUrl = Configuration.contributionsService.url,
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
    )
  }

  def toJson(model: DotcomFrontsRenderingDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    DotcomRenderingUtils.withoutNull(jsValue)
  }
}
