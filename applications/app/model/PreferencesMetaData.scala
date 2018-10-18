package model

import play.api.libs.json.JsBoolean

class PreferencesMetaData extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id = "preferences",
    section = Some(SectionId.fromId("Index")),
    webTitle = "Preferences",
    javascriptConfigOverrides = Map("isPreferencesPage" -> JsBoolean(true)))
}
