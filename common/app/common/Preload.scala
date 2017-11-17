package common

import model.ApplicationIdentity
import conf.switches.Switches.PolyfillIO
import html.HtmlPageHelpers.ContentCSSFile
import play.api.mvc.RequestHeader

object Preload {

  def articleDefaultPreloads(implicit request: RequestHeader): Seq[PreloadAsset] = Seq(
    CssPreloadAsset(s"$ContentCSSFile.css"),
    if (conf.switches.Switches.PolyfillIO.isSwitchedOn) {
      ThirdPartyJsPreload(common.Assets.js.polyfillioUrl)
    } else {
      JsPreloadAsset("javascripts/vendor/polyfillio.fallback.js")
    },
    JsPreloadAsset("javascripts/graun.standard.js"),
    JsPreloadAsset("javascripts/graun.commercial.js")
  )

  val faciaDefaultPreloads: Seq[PreloadAsset] = Seq(
    CssPreloadAsset("facia.css"),
    if (conf.switches.Switches.PolyfillIO.isSwitchedOn) {
      ThirdPartyJsPreload(common.Assets.js.polyfillioUrl)
    } else {
      JsPreloadAsset("javascripts/vendor/polyfillio.fallback.js")
    },
    JsPreloadAsset("javascripts/graun.standard.js"),
    JsPreloadAsset("javascripts/graun.commercial.js")
  )

  def config(implicit request: RequestHeader): Map[ApplicationIdentity, Seq[PreloadAsset]] = Map(
    ApplicationIdentity("article") -> articleDefaultPreloads,
    ApplicationIdentity("facia") -> faciaDefaultPreloads
  )
}
