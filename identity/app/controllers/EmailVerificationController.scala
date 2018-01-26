package controllers

import java.net.URLEncoder

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, Result}
import idapiclient.IdApiClient
import services.{AuthenticationService, IdRequestParser, IdentityUrlBuilder, ReturnUrlVerifier}
import common.ImplicitControllerExecutionContext
import utils.SafeLogging
import model.{ApplicationContext, IdentityPage}
import actions.AuthenticatedActions
import pages.IdentityHtmlPage

import scala.concurrent.Future


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
  import authenticatedActions.fullAuthWithIdapiUserAction

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

            case Right(_) => validated
          }
          val userIsLoggedIn = authenticationService.userIsFullyAuthenticated(request)
          val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)
          val verifiedReturnUrl = verifiedReturnUrlAsOpt.getOrElse(returnUrlVerifier.defaultReturnUrl)
          val encodedReturnUrl = URLEncoder.encode(verifiedReturnUrl, "utf-8")

          if(validationState.isValidated) {
            SeeOther(idUrlBuilder.buildUrl(s"/consents?returnUrl=$encodedReturnUrl"))
          } else {
            Ok(IdentityHtmlPage.html(views.html.emailVerified(validationState, idRequest, idUrlBuilder, userIsLoggedIn, verifiedReturnUrl))(page, request, context))
          }
      }
  }

  def resendEmailValidationEmail(isRepermissioningRedirect: Boolean, isSignupFlow: Boolean): Action[AnyContent] = fullAuthWithIdapiUserAction.async {
    implicit request =>
      val idRequest = idRequestParser(request)
      val customMessage = Some("To access all your account features and join the Guardian community, we need you to confirm your email address below.")

      val future = if(isSignupFlow) Future.successful((): Unit) else api.resendEmailValidationEmail(request.user.auth, idRequest.trackingData)

      future.map { _ =>
        Ok(
          IdentityHtmlPage.html(views.html.verificationEmailResent(request.user, idRequest, idUrlBuilder, customMessage, isSignupFlow))(page, request, context)
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
