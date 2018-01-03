package controllers

import java.net.URLEncoder

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, Result}
import idapiclient.IdApiClient
import services.{AuthenticationService, IdRequestParser, IdentityUrlBuilder, ReturnUrlVerifier}
import common.ImplicitControllerExecutionContext
import utils.SafeLogging
import model.{ApplicationContext, IdentityPage}
import actions.AuthenticatedActions
import conf.switches.Switches.IdentityPointToConsentJourneyPage
import pages.IdentityHtmlPage


class EmailVerificationController(api: IdApiClient,
  authenticatedActions: AuthenticatedActions,
  authenticationService: AuthenticationService,
  idRequestParser: IdRequestParser,
  idUrlBuilder: IdentityUrlBuilder,
  returnUrlVerifier: ReturnUrlVerifier,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with SafeLogging {

  import ValidationState._
  import authenticatedActions.authActionWithUser

  val page = IdentityPage("/verify-email", "Verify Email")

  def verify(token: String): Action[AnyContent] = Action.async {
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
          val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)
          val verifiedReturnUrl = verifiedReturnUrlAsOpt.getOrElse(returnUrlVerifier.defaultReturnUrl)
          val encodedReturnUrl = URLEncoder.encode(verifiedReturnUrl, "utf-8")

          if(validationState.isExpired || IdentityPointToConsentJourneyPage.isSwitchedOff) {
            Ok(views.html.emailVerified(validationState, page, idRequest, idUrlBuilder, userIsLoggedIn, verifiedReturnUrl))
          } else {
            SeeOther(idUrlBuilder.buildUrl(s"/consents?returnUrl=${encodedReturnUrl}"))
          }
      }
  }

  def resendEmailValidationEmail(isRepermissioningRedirect: Boolean): Action[AnyContent] = authActionWithUser.async {
    implicit request =>
      val idRequest = idRequestParser(request)
      val customMessage = if (isRepermissioningRedirect) Some("You must verify your email to continue.") else None
      api.resendEmailValidationEmail(request.user.auth, idRequest.trackingData).map { _ =>
        Ok(
          IdentityHtmlPage.html(views.html.verificationEmailResent(request.user, idRequest, idUrlBuilder, customMessage))(page, request, context)
        )
      }
  }
}

sealed case class ValidationState(isValidated: Boolean, isExpired: Boolean)
object ValidationState {
  val validated = new ValidationState(true, false)
  val expired = new ValidationState(false, true)
  val invalid = new ValidationState(false, false)
}
