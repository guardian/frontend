package tracking

import play.api.libs.json.{JsString, JsValue}
import services.IdentityRequest
import model.IdentityPage

object Omniture {

  def registrationStart(page: IdentityPage, idRequest: IdentityRequest): IdentityPage = {
    IdentityPage(
      page.id,
      page.webTitle,
      page.analyticsName,
      idRequest.returnUrl,
      Some("basicIdentity:Anewreg::theguardian"),
      Some("event30"))
  }

  def accountEdited(page: IdentityPage, idRequest: IdentityRequest) : IdentityPage = {
    IdentityPage(
      page.id,
      page.webTitle,
      page.analyticsName,
      idRequest.returnUrl,
      omnitureEvent = Some("event35"))
  }

  def tracking(page: IdentityPage, idRequest: IdentityRequest) : IdentityPage = {
    IdentityPage(
      page.id,
      page.webTitle,
      page.analyticsName,
      idRequest.returnUrl)
  }
}
