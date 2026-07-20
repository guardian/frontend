package model.dotcomrendering

import ab.ABTests
import common.Edition
import conf.Configuration
import model.Page
import model.dotcomrendering.DotcomRenderingUtils.assetURL
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

object DotcomRenderingConfig {
  val removeProperties: Seq[String] = Seq("thumbnail")

  def apply(
      page: Page,
      request: RequestHeader,
      isPreview: Boolean,
  ): JsObject = {
    val switches: Map[String, Boolean] = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })

    val config = Config(
      switches = switches,
      serverSideABTests = ABTests.getParticipations(request),
      ampIframeUrl = assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val jsPageConfig: Map[String, JsValue] =
      JavaScriptPage.getMap(page, Edition(request), isPreview, request)

    val combinedConfig = Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))

    /** Remove legacy config not used by DCR
      *
      * See: https://github.com/guardian/dotcom-rendering/pull/15767
      *
      * Properties removed here should also be deleted from the LegacyConfig type in DCR
      * https://github.com/guardian/dotcom-rendering/blob/7f862e949d50bf98a4505995121502cfbd8daaf6/dotcom-rendering/src/types/config.ts#L94-L100
      */
    JsObject(combinedConfig.fields.filterNot { case (key, _) => removeProperties.contains(key) })
  }
}
