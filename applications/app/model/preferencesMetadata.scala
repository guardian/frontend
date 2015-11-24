package model

import play.api.libs.json.{JsBoolean, JsValue}

class PreferencesMetaData extends Page {
  override val metadata = MetaData.make(
    id = "preferences",
    section = "Index",
    analyticsName = "Preferences",
    webTitle = "Preferences")

  val getJavascriptConfig: Map[String, JsValue] = metadata.javascriptConfig + ("isPreferencesPage" -> JsBoolean(true))
}
