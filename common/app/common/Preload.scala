package common

import model.ApplicationIdentity
import conf.switches.Switches.PolyfillIO
import html.HtmlPageHelpers.pillarCardCSSFileContent

object Preload {

  val articleDefaultPreloads: Seq[PreloadAsset] = Seq(
    CssPreloadAsset(s"$pillarCardCSSFileContent.css"),
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

  val config: Map[ApplicationIdentity, Seq[PreloadAsset]] = Map(
    ApplicationIdentity("article") -> articleDefaultPreloads,
    ApplicationIdentity("facia") -> faciaDefaultPreloads
  )
}
