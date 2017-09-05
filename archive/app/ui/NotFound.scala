package ui

import conf.{Static, Configuration}
import play.api.libs.json.{JsValue, Json}
import rendering.Renderable
import conf.switches.Switches.{PolyfillIO}

object NotFound extends Renderable {
  val polyfillioUrl = if(PolyfillIO.isSwitchedOn) common.Assets.js.polyfillioUrl else Static("javascripts/vendor/polyfillio.fallback.js")

  override def props: Option[JsValue] = Some(
    Json.obj(
      "beaconUrl" -> Configuration.debug.beaconUrl,
      "bundleUrl" -> Static("javascripts/ui.bundle.browser.js"),
      "polyfillioUrl" -> polyfillioUrl
    )
  )
}

