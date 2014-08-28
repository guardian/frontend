package tracking

import play.api.libs.json.{JsString, JsValue}
import services.IdentityRequest
import model.IdentityPage

trait Omniture {
  val trackingParams = false
  val id: String
  val webTitle: String
  val analyticsName: String
  def metaData: Map[String, JsValue]

  def metaDataFor(
    returnUrl: Option[String],
    registrationType: Option[String] = None,
    omnitureEvent: Option[String] = None
  ) = metaData ++ Seq(
    Some("contentType" -> JsString("userid")), // For the no js omniture tracking
    returnUrl.map("returnUrl" -> JsString(_)),
    registrationType.map("registrationType" -> JsString(_)),
    omnitureEvent.map("omnitureEvent" -> JsString(_))
  ).flatten

  def registrationStart(idRequest: IdentityRequest): IdentityPage with TrackingParams = {
    val newMetadata = metaDataFor(
      idRequest.returnUrl,
      Some("basicIdentity:Anewreg::theguardian"),
      Some("event30")
    )
    new IdentityPage(id, webTitle, analyticsName, Some(newMetadata)) with TrackingParams
  }

  def registrationError(idRequest: IdentityRequest): IdentityPage with TrackingParams = {
    val newMetadata = metaDataFor(
      idRequest.returnUrl,
      Some("basicIdentity:Anewreg::theguardian"),
      Some("event33")
    )
    new IdentityPage(id, webTitle, analyticsName, Some(newMetadata)) with TrackingParams
  }

  def signinAuthenticationError(idRequest: IdentityRequest) : IdentityPage with TrackingParams = {
    val newMetadata = metaDataFor(
      idRequest.returnUrl,
      Some("Authentication failed"),
      Some("event34")
    )
    new IdentityPage(id, webTitle, analyticsName, Some(newMetadata)) with TrackingParams
  }

  def signinValidationError(idRequest: IdentityRequest) : IdentityPage with TrackingParams = {
    val newMetadata = metaDataFor(
      idRequest.returnUrl,
      Some("Validation failed"),
      Some("event34")
    )
    new IdentityPage(id, webTitle, analyticsName, Some(newMetadata)) with TrackingParams
  }

  def accountEdited(idRequest: IdentityRequest) : IdentityPage with TrackingParams = {
    val newMetadata = metaDataFor(
      idRequest.returnUrl,
      omnitureEvent = Some("event35")
    )
    new IdentityPage(id, webTitle, analyticsName, Some(newMetadata)) with TrackingParams
  }

  def tracking(idRequest: IdentityRequest) : IdentityPage with TrackingParams = {
    val newMetadata = metaDataFor(
      idRequest.returnUrl
    )
    new IdentityPage(id, webTitle, analyticsName, Some(newMetadata)) with TrackingParams
  }
}

trait TrackingParams {
  val trackingParams = true
}
