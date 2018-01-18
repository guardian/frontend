package common

import model.ApplicationIdentity
import html.HtmlPageHelpers.ContentCSSFile
import play.api.mvc.RequestHeader
import experiments.{CommercialBaseline, ActiveExperiments}

object Preload {

  def commercialBundleName(implicit request: RequestHeader): String =
    if (ActiveExperiments.isParticipating(CommercialBaseline)) {
    "graun.commercial-control.js"
  } else {
    "graun.commercial.js"
  }

  def articleDefaultPreloads(implicit request: RequestHeader): Seq[PreloadAsset] = Seq(
    CssPreloadAsset(s"$ContentCSSFile.css"),
    if (conf.switches.Switches.PolyfillIO.isSwitchedOn) {
      ThirdPartyJsPreload(common.Assets.js.polyfillioUrl)
    } else {
      JsPreloadAsset("javascripts/vendor/polyfillio.fallback.js")
    },
    JsPreloadAsset("javascripts/graun.standard.js"),
    JsPreloadAsset(s"javascripts/$commercialBundleName")
  )

  def faciaDefaultPreloads(implicit request: RequestHeader): Seq[PreloadAsset] = Seq(
    CssPreloadAsset("facia.css"),
    if (conf.switches.Switches.PolyfillIO.isSwitchedOn) {
      ThirdPartyJsPreload(common.Assets.js.polyfillioUrl)
    } else {
      JsPreloadAsset("javascripts/vendor/polyfillio.fallback.js")
    },
    JsPreloadAsset("javascripts/graun.standard.js"),
    JsPreloadAsset(s"javascripts/$commercialBundleName")
  )

  def config(implicit request: RequestHeader): Map[ApplicationIdentity, Seq[PreloadAsset]] = Map(
    ApplicationIdentity("article") -> articleDefaultPreloads,
    ApplicationIdentity("facia") -> faciaDefaultPreloads
  )
}
