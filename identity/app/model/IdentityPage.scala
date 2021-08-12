package model

import play.api.libs.json.JsString

case class IdentityPage(
    id: String,
    webTitle: String,
    returnUrl: Option[String] = None,
    registrationType: Option[String] = None,
    isFlow: Boolean = false,
    usesGuardianHeader: Boolean = false,
) extends StandalonePage {

  private val javascriptConfig = Seq(
    returnUrl.map("returnUrl" -> JsString(_)),
    registrationType.map("registrationType" -> JsString(_)),
  ).flatten.toMap

  override val metadata = MetaData.make(
    id = id,
    section = Some(SectionId.fromId("identity")),
    webTitle = webTitle,
    contentType = Some(DotcomContentType.Identity),
    javascriptConfigOverrides = javascriptConfig,
  )
}
