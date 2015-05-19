package model

class PreferencesMetaData extends MetaData {
  override def id: String = "preferences"

  override def section: String = "Index"

  override def analyticsName: String = "Preferences"

  override def webTitle: String = "Preferences"
}

class NotificationPreferencesMetaData extends MetaData {
  override def id: String = "preferences/notifications"

  override def section: String = "Index"

  override def analyticsName: String = "Notification Preferences"

  override def webTitle: String = "Notification Preferences"
}
