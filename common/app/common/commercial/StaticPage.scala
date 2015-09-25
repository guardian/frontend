package common.commercial

import model.GuardianContentTypes.Interactive
import model.MetaData

trait StaticPage extends MetaData {
  val section: String = "global"
  val analyticsName: String = id
  // content-type is set to keep the slim header: there's probably a better way to do this
  override lazy val contentType: String = Interactive
  override val hasSlimHeader: Boolean = true
  override val shouldGoogleIndex: Boolean = false
}
