package layout

sealed trait FaciaCardTimestamp {
  def javaScriptUpdate: Boolean

  def formatString: String
}

// By default a date string, but uses JavaScript to update to a human readable string like '22h' meaning 22 hours ago
case object DateOrTimeAgo extends FaciaCardTimestamp {
  override val javaScriptUpdate: Boolean = true
  override val formatString: String = "d MMM y"
}

case object DateTimestamp extends FaciaCardTimestamp {
  override val javaScriptUpdate: Boolean = false
  override val formatString: String = "d MMM y"
}

case object TimeTimestamp extends FaciaCardTimestamp {
  override val javaScriptUpdate: Boolean = false
  override val formatString: String = "h:mm aa"
}
