package controllers

import play.api.mvc.{Controller, Action}
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import services.{AuthenticationService, IdentityUrlBuilder, IdRequestParser}
import common.ExecutionContexts
import utils.SafeLogging
import model.IdentityPage
import actions.AuthActionWithUser

@Singleton
class EmailVerificationController @Inject()( api: IdApiClient,
                                             authActionWithUser: AuthActionWithUser,
                                             authenticationService: AuthenticationService,
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
          val userIsLoggedIn = authenticationService.requestPresentsAuthenticationCredentials(request)
          Ok(views.html.email_verified(validationState, page, idRequest, idUrlBuilder, userIsLoggedIn))
      }
  }

  def resendEmailValidationEmail() = authActionWithUser.async {
    implicit request =>
      val idRequest = idRequestParser(request)
      api.resendEmailValidationEmail(request.auth, idRequest.trackingData).map { _ =>
        Ok(views.html.verificationEmailResent(request.user, page, idRequest, idUrlBuilder))
      }
  }
}

sealed case class ValidationState(isValidated: Boolean, isExpired: Boolean)
object ValidationState {
  val validated = new ValidationState(true, false)
  val expired = new ValidationState(false, true)
  val invalid = new ValidationState(false, false)
}