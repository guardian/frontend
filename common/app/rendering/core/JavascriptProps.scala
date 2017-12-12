package rendering.core

import conf.Configuration
import play.api.libs.json.{JsValue, Json, Writes}

case class TypeFace(typeFace: String, fileTypes: Seq[FileType])

object TypeFace {
  implicit val typeFaceWriter: Writes[TypeFace] = Json.writes[TypeFace]
}

case class FileType(fileType: String, endpoint: String, hintTypes: Seq[HintType])

object FileType {
  implicit val fileTypeWriter: Writes[FileType] = Json.writes[FileType]
}

case class HintType(hintType: String, endpoint: String)

object HintType {
  implicit val hintTypeWriter: Writes[HintType] = Json.writes[HintType]
}

case class JavascriptPropsConfig(bundleUrl: String, polyfillioUrl: String, beaconUrl: String, fontDefinitions: List[TypeFace])
case class JavascriptProps(config: JavascriptPropsConfig){
  def asJsValue: JsValue = Json.toJson(this)
}

object JavascriptProps {
  implicit val javascriptPropsConfig: Writes[JavascriptPropsConfig] = Json.writes[JavascriptPropsConfig]
  implicit val javascriptProps: Writes[JavascriptProps] = Json.writes[JavascriptProps]

  def getFontDefinitions(): List[TypeFace] = {
    val typeFaces = List("GuardianEgyptianWeb", "GuardianTextEgyptianWeb", "GuardianTextSansWeb")
    val fileTypes = List("woff2", "woff", "ttf")
    val hintTypes = List("cleartype", "auto")

    typeFaces.map(typeFace => {
      TypeFace(typeFace, fileTypes.map { fileType =>
        val fileTypeEndpoint = conf.Static(s"fonts/${typeFace}.${fileType}.json")

        FileType(fileType, fileTypeEndpoint, hintTypes.map { hintType => {
          val hintTypeEndpoint = conf.Static(s"fonts/${typeFace}${hintType.capitalize}Hinted.${fileType}.json")
          HintType(hintType, hintTypeEndpoint)
        }})
      })
    })
  }

  def default: JavascriptProps = {
    val bundleUrl = conf.Static("javascripts/ui.bundle.browser.js")
    val polyfillioUrl =
      if (conf.switches.Switches.PolyfillIO.isSwitchedOn) common.Assets.js.polyfillioUrl
      else conf.Static("javascripts/vendor/polyfillio.fallback.js")
    val beaconUrl = Configuration.debug.beaconUrl

    JavascriptProps(JavascriptPropsConfig(bundleUrl, polyfillioUrl, beaconUrl, getFontDefinitions()))
  }
}
