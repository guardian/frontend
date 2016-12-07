package model

import play.api.libs.json.JsString

case class IdentityPage(
  id: String,
  webTitle: String,
  returnUrl: Option[String] = None,
  registrationType: Option[String] = None) extends StandalonePage {

  private val javascriptConfig = Seq(
    returnUrl.map("returnUrl" -> JsString(_)),
    registrationType.map("registrationType" -> JsString(_))
  ).flatten.toMap

  override val metadata = MetaData.make(
    id = id,
    section = Some(SectionSummary.fromId("identity")),
    webTitle = webTitle,
    contentType = "userid", // For the no js omniture tracking
    javascriptConfigOverrides = javascriptConfig)
}
