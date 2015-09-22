package common.commercial

import model.MetaData

trait StaticPage extends MetaData {
  val section: String = "global"
  val analyticsName: String = id
  override val hasSlimHeader: Boolean = true
  override val shouldGoogleIndex: Boolean = false
}
