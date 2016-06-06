package model

import play.api.libs.json.JsString

case class IdentityPage(
  id: String,
  webTitle: String,
  analyticsName: String,
  returnUrl: Option[String] = None,
  registrationType: Option[String] = None,
  omnitureEvent: Option[String] = None) extends StandalonePage {

  private val javascriptConfig = Seq(
    returnUrl.map("returnUrl" -> JsString(_)),
    registrationType.map("registrationType" -> JsString(_)),
    omnitureEvent.map("omnitureEvent" -> JsString(_))
  ).flatten.toMap

  override val metadata = MetaData.make(
    id = id,
    sectionSummary = Some(SectionSummary.fromId("identity")),
    webTitle = webTitle,
    analyticsName = analyticsName,
    contentType = "userid", // For the no js omniture tracking
    javascriptConfigOverrides = javascriptConfig)
}
