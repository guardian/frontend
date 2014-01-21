package controllers

import play.api.mvc.{Controller, Action}
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import services.{IdentityUrlBuilder, IdRequestParser}
import common.ExecutionContexts
import utils.SafeLogging
import model.IdentityPage

@Singleton
class EmailVerificationController @Inject()( api: IdApiClient,
                                             idRequestParser: IdRequestParser,
                                             idUrlBuilder: IdentityUrlBuilder)
  extends Controller with ExecutionContexts with SafeLogging {
  import ValidationState._

  val page = IdentityPage("/verify-email", "Verify Email", "verify-email")

  def verify(token: String) = Action.async {
    implicit request =>
      val idRequest = idRequestParser(request)

      api.validateEmail(token, idRequest.trackingData) map {
        response =>
          val validationState = response match {
            case Left(errors) =>
              errors.head.message match {
                case "User Already Validated" => validated
                case "Token expired" => expired
                case error => logger.warn("Error validating email: " + error); invalid
              }

            case Right(ok) => validated
          }
          Ok(views.html.email_verified(validationState, page, idRequest, idUrlBuilder))
      }
  }
}

sealed case class ValidationState(isValidated: Boolean, isExpired: Boolean)
object ValidationState {
  val validated = new ValidationState(true, false)
  val expired = new ValidationState(false, true)
  val invalid = new ValidationState(false, false)
}