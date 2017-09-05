package ui

import conf.{Static, Configuration}
import play.api.libs.json.{JsValue, Json}
import rendering.Renderable

object NotFound extends Renderable {
  override def props: Option[JsValue] = Some(
    Json.obj(
      "beaconUrl" -> Configuration.debug.beaconUrl,
      "bundleURL" -> Static("javascripts/ui.bundle.browser.js")
    )
  )
}

