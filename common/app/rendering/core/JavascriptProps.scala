package rendering.core

import conf.Configuration
import play.api.libs.json.{JsValue, Json, Writes}

case class JavascriptPropsConfig(bundleUrl: String, polyfillioUrl: String, beaconUrl: String)
case class JavascriptProps(config: JavascriptPropsConfig){
  def asJsValue: JsValue = Json.toJson(this)
}

object JavascriptProps {
  implicit val javascriptPropsConfig: Writes[JavascriptPropsConfig] = Json.writes[JavascriptPropsConfig]
  implicit val javascriptProps: Writes[JavascriptProps] = Json.writes[JavascriptProps]
  def default: JavascriptProps = {
    val bundleUrl = conf.Static("javascripts/ui.bundle.browser.js")
    val polyfillioUrl =
      if (conf.switches.Switches.PolyfillIO.isSwitchedOn) common.Assets.js.polyfillioUrl
      else conf.Static("javascripts/vendor/polyfillio.fallback.js")
    val beaconUrl = Configuration.debug.beaconUrl

    JavascriptProps(JavascriptPropsConfig(bundleUrl, polyfillioUrl, beaconUrl))
  }
}
