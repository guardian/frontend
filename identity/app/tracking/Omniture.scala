package tracking

import services.IdentityRequest
import model.IdentityPage

trait Omniture {
  val trackingParams = false
  val id: String
  val webTitle: String
  val analyticsName: String
  def metaData: Map[String, Any]

  private def addMetadata(values: (String, Any)*) = {
    metaData ++ values
  }

  def registrationStart(idRequest: IdentityRequest): IdentityPage with TrackingParams = {
    val newMetadata = addMetadata(
      "returnUrl" -> idRequest.returnUrl,
      "content-type" -> "userid", // For the no js omniture tracking
      "registrationType" -> "basicIdentity:Anewreg::theguardian",
      "omnitureEvent" -> "event30"
    )
    new IdentityPage(id, webTitle, analyticsName, Some(newMetadata)) with TrackingParams
  }

  def registrationError(idRequest: IdentityRequest): IdentityPage with TrackingParams = {
    val newMetadata = addMetadata(
      "returnUrl" -> idRequest.returnUrl,
      "content-type" -> "userid", // For the no js omniture tracking
      "registrationType" -> "basicIdentity:Anewreg::theguardian",
      "omnitureEvent" -> "event33"
    )
    new IdentityPage(id, webTitle, analyticsName, Some(newMetadata)) with TrackingParams
  }

  def signinError(idRequest: IdentityRequest) : IdentityPage with TrackingParams = {
    val newMetadata = addMetadata(
      "returnUrl" -> idRequest.returnUrl,
      "content-type" -> "userid", // For the no js omniture tracking
      "omnitureEvent" -> "event34",
      "identityErrorMessage" -> "Authentication failed"
    )
    new IdentityPage(id, webTitle, analyticsName, Some(newMetadata)) with TrackingParams
  }
}

trait TrackingParams {
  val trackingParams = true
}
