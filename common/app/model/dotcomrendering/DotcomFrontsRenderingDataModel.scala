package model.dotcomrendering

import common.Edition
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import conf.Configuration
import experiments.ActiveExperiments
import model.PressedPage
import navigation.Nav
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

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
)

object DotcomFrontsRenderingDataModel {
  implicit val writes = Json.writes[DotcomFrontsRenderingDataModel]

  def apply(page: PressedPage, request: RequestHeader, pageType: PageType): DotcomFrontsRenderingDataModel = {
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

    DotcomFrontsRenderingDataModel(
      pressedPage = page,
      nav = nav,
      editionId = edition.id,
      editionLongForm = edition.displayName,
      guardianBaseURL = Configuration.site.host,
      pageId = page.metadata.id,
      webTitle = page.metadata.webTitle,
      webURL = page.metadata.webUrl,
      config = combinedConfig,
      commercialProperties = commercialProperties,
    )
  }

  def toJson(model: DotcomFrontsRenderingDataModel): String = {
    val jsValue = Json.toJson(model)
    Json.stringify(DotcomRenderingUtils.withoutNull(jsValue))
  }
}
