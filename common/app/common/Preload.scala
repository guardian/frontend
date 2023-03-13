package common

import model.ApplicationIdentity
import html.HtmlPageHelpers.ContentCSSFile
import play.api.mvc.RequestHeader

object Preload {

  def commercialBundleNameAsset(implicit request: RequestHeader): Seq[PreloadAsset] =
    Seq.empty

  def isPolyFillIOFallbackMin: Seq[PreloadAsset] =
    if (conf.switches.Switches.PolyfillIOFallbackMin.isSwitchedOn)
      Seq(JsPreloadAsset("javascripts/vendor/polyfillio.minimum.fallback.js"))
    else Seq.empty

  def articleDefaultPreloads(implicit request: RequestHeader): Seq[PreloadAsset] =
    Seq(
      CssPreloadAsset(s"$ContentCSSFile.css"),
      if (conf.switches.Switches.PolyfillIO.isSwitchedOn) {
        ThirdPartyJsPreload(common.Assets.js.polyfillioUrl)
      } else {
        JsPreloadAsset("javascripts/vendor/polyfillio.fallback.js")
      },
      JsPreloadAsset("javascripts/graun.standard.js"),
    ) ++ isPolyFillIOFallbackMin ++ commercialBundleNameAsset

  def faciaDefaultPreloads(implicit request: RequestHeader): Seq[PreloadAsset] =
    Seq(
      CssPreloadAsset("facia.css"),
      if (conf.switches.Switches.PolyfillIO.isSwitchedOn) {
        ThirdPartyJsPreload(common.Assets.js.polyfillioUrl)
      } else {
        JsPreloadAsset("javascripts/vendor/polyfillio.fallback.js")
      },
      JsPreloadAsset("javascripts/graun.standard.js"),
    ) ++ isPolyFillIOFallbackMin ++ commercialBundleNameAsset

  def config(implicit request: RequestHeader): Map[ApplicationIdentity, Seq[PreloadAsset]] =
    Map(
      ApplicationIdentity("article") -> articleDefaultPreloads,
      ApplicationIdentity("facia") -> faciaDefaultPreloads,
    )
}
