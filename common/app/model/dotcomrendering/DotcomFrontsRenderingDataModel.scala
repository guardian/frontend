package model.dotcomrendering

import common.{CanonicalLink, Edition}
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import conf.Configuration
import experiments.ActiveExperiments
import model.{PressedPage, RelatedContentItem}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, OWrites}
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage, Commercial}
import ab.ABTests

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

    val switches: Map[String, Boolean] = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })

    val config = Config(
      switches = switches,
      abTests = ActiveExperiments.getJsMap(request),
      serverSideABTests = ABTests.allTests(request),
      ampIframeUrl = DotcomRenderingUtils.assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val combinedConfig: JsObject = {
      val jsPageConfig: Map[String, JsValue] =
        JavaScriptPage.getMap(page, Edition(request), pageType.isPreview, request)
      Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
    }

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
      isAdFreeUser = Commercial.isAdFree(request),
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
