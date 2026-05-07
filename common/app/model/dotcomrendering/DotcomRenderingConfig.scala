package model.dotcomrendering

import ab.ABTests
import common.Edition
import conf.Configuration
import experiments.ActiveExperiments
import model.Page
import model.dotcomrendering.DotcomRenderingUtils.assetURL
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

object DotcomRenderingConfig {
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
      abTests = ActiveExperiments.getJsMap(request),
      serverSideABTests = ABTests.getParticipations(request),
      ampIframeUrl = assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val jsPageConfig: Map[String, JsValue] =
      JavaScriptPage.getMap(page, Edition(request), isPreview, request)

    Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
  }
}
