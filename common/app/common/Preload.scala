package common

import model.ApplicationIdentity
import html.HtmlPageHelpers.ContentCSSFile
import play.api.mvc.RequestHeader
import experiments.ActiveExperiments

object Preload {

  def commercialBundleName(implicit request: RequestHeader): String = "graun.commercial.js"

  def isPFFallbackMin: Seq[PreloadAsset] =
    if (conf.switches.Switches.PolyfillIOFallbackMin.isSwitchedOn) Seq(JsPreloadAsset("javascripts/vendor/polyfillio.minimum.fallback.js")) else Seq.empty

  def articleDefaultPreloads(implicit request: RequestHeader): Seq[PreloadAsset] = Seq(
    CssPreloadAsset(s"$ContentCSSFile.css"),
    if (conf.switches.Switches.PolyfillIO.isSwitchedOn) {
      ThirdPartyJsPreload(common.Assets.js.polyfillioUrl)
    } else {
      JsPreloadAsset("javascripts/vendor/polyfillio.fallback.js")
    },
    JsPreloadAsset("javascripts/graun.standard.js"),
    JsPreloadAsset(s"javascripts/$commercialBundleName")
  ) ++ isPFFallbackMin


  def faciaDefaultPreloads(implicit request: RequestHeader): Seq[PreloadAsset] = Seq(
    CssPreloadAsset("facia.css"),
    if (conf.switches.Switches.PolyfillIO.isSwitchedOn) {
      ThirdPartyJsPreload(common.Assets.js.polyfillioUrl)
    } else {
      JsPreloadAsset("javascripts/vendor/polyfillio.fallback.js")
    },
    JsPreloadAsset("javascripts/graun.standard.js"),
    JsPreloadAsset(s"javascripts/$commercialBundleName")
  ) ++ isPFFallbackMin

  def config(implicit request: RequestHeader): Map[ApplicationIdentity, Seq[PreloadAsset]] = Map(
    ApplicationIdentity("article") -> articleDefaultPreloads,
    ApplicationIdentity("facia") -> faciaDefaultPreloads
  )
}
