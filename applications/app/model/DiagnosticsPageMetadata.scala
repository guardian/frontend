package model

import play.api.libs.json.JsBoolean

class DiagnosticsPageMetadata extends StandalonePage {
  override val metadata = MetaData.make(
    id = "Browser Diagnostics",
    section = Some(SectionId.fromId("Index")),
    webTitle = "Browser Diagnostics",
    javascriptConfigOverrides = Map("isDiagnosticsPage" -> JsBoolean(true)),
  )
}
