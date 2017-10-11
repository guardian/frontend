package rendering.core

import conf.Configuration
import play.api.libs.json.{Json, Writes}

case class JavascriptProps(
  bundleUrl: String = conf.Static("javascripts/ui.bundle.browser.js"),
  polyfillioUrl: String =
    if (conf.switches.Switches.PolyfillIO.isSwitchedOn) common.Assets.js.polyfillioUrl
    else conf.Static("javascripts/vendor/polyfillio.fallback.js"),
  beaconUrl: String = Configuration.debug.beaconUrl
)

object JavascriptProps {
  implicit val javascriptProps: Writes[JavascriptProps] = Json.writes[JavascriptProps]
}
