package controllers

import java.net.{URI, URLEncoder}

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import idapiclient.IdApiClient
import services.{AuthenticationService, IdRequestParser, IdentityUrlBuilder, PlaySigninService, ReturnUrlVerifier}
import common.ImplicitControllerExecutionContext
import utils.SafeLogging
import model.{ApplicationContext, IdentityPage}
import actions.AuthenticatedActions
import idapiclient.responses.CookiesResponse
import pages.IdentityHtmlPage

import scala.concurrent.Future
import scala.util.Try


class EmailVerificationController(api: IdApiClient,
  authenticatedActions: AuthenticatedActions,
  authenticationService: AuthenticationService,
  idRequestParser: IdRequestParser,
  idUrlBuilder: IdentityUrlBuilder,
  returnUrlVerifier: ReturnUrlVerifier,
  signinService: PlaySigninService,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with SafeLogging {

  import ValidationState._
  import authenticatedActions.fullAuthWithIdapiUserAction


  def verify(token: String): Action[AnyContent] = Action.async {
    implicit request =>
      val idRequest = idRequestParser(request)
      val page = IdentityPage("/verify-email", "Verify Email")
      api.validateEmail(token, idRequest.trackingData) map {
        response =>
          val validationState = response match {
            case Left(errors) =>
              errors.head.message match {
                case "User Already Validated" => alreadyValidated
                case "Token expired" => expired
                case error => logger.warn("Error validating email: " + error); invalid
              }

            case Right(cookies) => validatedWithSession(cookies)
          }
          val userIsLoggedIn = authenticationService.userIsFullyAuthenticated(request)
          val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)
          val verifiedReturnUrl = verifiedReturnUrlAsOpt.getOrElse(returnUrlVerifier.defaultReturnUrl)
          val encodedReturnUrl = URLEncoder.encode(verifiedReturnUrl, "utf-8")

          if(validationState.isValidated) {
            // Only redirect to consent journey return URL if not the journey already
            val redirectUrl = Try(new URI(verifiedReturnUrl)).toOption
              .flatMap { uri =>
                val consentJourneyPath = "^\\/consents([?/#].*)?$".r
                consentJourneyPath.findFirstMatchIn(uri.getPath).map(_ => verifiedReturnUrl)
              }

            val cookies = validationState.authenticationCookies.map(signinService.getCookies(_, rememberMe = true)).getOrElse(Nil)

            SeeOther(redirectUrl.getOrElse(idUrlBuilder.buildUrl(s"/consents?returnUrl=$encodedReturnUrl"))).withCookies(cookies:_*)
          } else {
            Ok(IdentityHtmlPage.html(views.html.emailVerified(validationState, idRequest, idUrlBuilder, userIsLoggedIn, verifiedReturnUrl))(page, request, context))
          }
      }
  }

  def completeRegistration(): Action[AnyContent] = fullAuthWithIdapiUserAction.async {
    implicit request =>
      val idRequest = idRequestParser(request)
      val page = IdentityPage("/complete-registration", "Complete Signup", isFlow = true)
      val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)

      Future.successful(Ok(IdentityHtmlPage.html(
          views.html.verificationEmailResent(request.user, idRequest, idUrlBuilder, verifiedReturnUrlAsOpt, returnUrlVerifier.defaultReturnUrl, isSignupFlow = true)
      )(page, request, context)))
  }

  def resendEmailValidationEmail(): Action[AnyContent] = fullAuthWithIdapiUserAction.async {
    implicit request =>
      val idRequest = idRequestParser(request)
      val page = IdentityPage("/verify-email", "Verify Email")
      val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)

      api.resendEmailValidationEmail(
        request.user.auth,
        idRequest.trackingData,
        verifiedReturnUrlAsOpt
      ).map(_ =>
        Ok(IdentityHtmlPage.html(views.html.verificationEmailResent(request.user, idRequest, idUrlBuilder, verifiedReturnUrlAsOpt, returnUrlVerifier.defaultReturnUrl))(page, request, context))
      )

  }
}

sealed case class ValidationState(isValidated: Boolean, isExpired: Boolean, authenticationCookies: Option[CookiesResponse] = None)

object ValidationState {
  def validatedWithSession(autheniticationCookies: CookiesResponse): ValidationState = ValidationState(isValidated = true, isExpired = false, Some(autheniticationCookies))
  val alreadyValidated = ValidationState(isValidated = true, isExpired = false)
  val expired = ValidationState(isValidated = false, isExpired = true)
  val invalid = ValidationState(isValidated = false, isExpired = false)
}
