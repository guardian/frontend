package model

import play.api.libs.json.{JsBoolean, JsValue}
import tracking.Omniture

class IdentityPage(id: String, webTitle: String, analyticsName: String, overridenMetadata: Option[Map[String, JsValue]] = None)
  extends Page(id, "identity", webTitle, analyticsName) {

  override def metaData: Map[String, JsValue] =
    overridenMetadata.getOrElse(super.metaData + ("blockVideoAds" -> JsBoolean(true)))
}
object IdentityPage {
  def apply(id: String, webTitle: String, analyticsName: String): IdentityPage with Omniture = {
    new IdentityPage(id, webTitle, analyticsName, None) with Omniture
  }
}
