package model

import play.api.libs.json.{JsBoolean, JsValue}

class PreferencesMetaData extends MetaData {
  override def id: String = "preferences"

  override def section: String = "Index"

  override def analyticsName: String = "Preferences"

  override def webTitle: String = "Preferences"

  override lazy val metaData: Map[String, JsValue] = super.metaData + ("isPreferencesPage" -> JsBoolean(true))
}

class NotificationPreferencesMetaData extends MetaData {
  override def id: String = "preferences/notifications"

  override def section: String = "Index"

  override def analyticsName: String = "Notification Preferences"

  override def webTitle: String = "Notification Preferences"

  override lazy val metaData: Map[String, JsValue] = super.metaData + ("isPreferencesPage" -> JsBoolean(true))
}
