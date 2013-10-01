package model

import tracking.Omniture

class IdentityPage(id: String, webTitle: String, analyticsName: String, overridenMetadata: Option[Map[String, Any]] = None)
  extends Page(id, "identity", webTitle, analyticsName) {

  override def metaData: Map[String, Any] = overridenMetadata.getOrElse(super.metaData + ("blockAds" -> true))
}
object IdentityPage {
  def apply(id: String, webTitle: String, analyticsName: String): IdentityPage with Omniture = {
    new IdentityPage(id, webTitle, analyticsName, None) with Omniture
  }
}
