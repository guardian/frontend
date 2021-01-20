package controllers

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import idapiclient.IdApiClient
import services.{AuthenticationService, IdRequestParser, IdentityUrlBuilder, PlaySigninService, ReturnUrlVerifier}
import common.ImplicitControllerExecutionContext
import utils.SafeLogging
import model.{ApplicationContext, IdentityPage}
import actions.AuthenticatedActions
import pages.IdentityHtmlPage

import scala.concurrent.Future

class EmailVerificationController(
    api: IdApiClient,
    authenticatedActions: AuthenticatedActions,
    authenticationService: AuthenticationService,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    returnUrlVerifier: ReturnUrlVerifier,
    signinService: PlaySigninService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging {

  def completeRegistration(): Action[AnyContent] =
    Action.async { implicit request =>
      val page = IdentityPage("/complete-registration", "Complete Signup", isFlow = true)
      val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)

      request
        .getQueryString("encryptedEmail")
        .map(encryptedEmail => {
          api.decryptEmailToken(encryptedEmail) map {
            case Left(errors) =>
              logger.error(s"Could not decrypt email address on complete registration page: $errors")
              errorPage(verifiedReturnUrlAsOpt, page)
            case Right(email) =>
              successPage(verifiedReturnUrlAsOpt, page, Some(email), EmailNotResent)
                .withSession("encryptedEmail" -> encryptedEmail, "email" -> email)
          }
        })
        .getOrElse({
          logger.error("No encryptedEmail parameter present on complete registration page request")
          Future.successful(errorPage(verifiedReturnUrlAsOpt, page))
        })
    }

  def resendValidationEmail(returnUrl: String): Action[AnyContent] =
    Action.async { implicit request =>
      val page = IdentityPage("/complete-registration", "Complete Signup", isFlow = true)
      val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)
      val email = request.session.get("email")

      request.session
        .get("encryptedEmail")
        .map(token =>
          api.resendEmailValidationEmailByToken(token, verifiedReturnUrlAsOpt) map {
            case Left(errors) =>
              logger.error(s"Could not resent validation email on complete registration page: $errors")
              successPage(verifiedReturnUrlAsOpt, page, email, ErrorResending)
            case Right(_) =>
              successPage(verifiedReturnUrlAsOpt, page, email, EmailResent)
          },
        )
        .getOrElse({
          logger.error(
            "Could not resend validation on complete registration page - no encryptedEmail token present in session",
          )
          Future.successful(errorPage(verifiedReturnUrlAsOpt, page))
        })
    }

  private def successPage(
      verifiedReturnUrlAsOpt: Option[String],
      page: IdentityPage,
      email: Option[String],
      validationEmailResent: ValidationEmailSent,
  )(implicit request: RequestHeader): Result = {
    Ok(
      IdentityHtmlPage.html(
        views.html.verificationEmailResent(
          idUrlBuilder,
          verifiedReturnUrlAsOpt,
          returnUrlVerifier.defaultReturnUrl,
          email,
          validationEmailResent,
        ),
      )(page, request, context),
    )
  }

  private def errorPage(verifiedReturnUrlAsOpt: Option[String], page: IdentityPage)(implicit
      request: RequestHeader,
  ): Result = {
    Ok(
      IdentityHtmlPage.html(
        views.html.verificationEmailResentError(
          verifiedReturnUrlAsOpt,
          returnUrlVerifier.defaultReturnUrl,
        ),
      )(page, request, context),
    )
  }
}

sealed trait ValidationEmailSent
case object EmailResent extends ValidationEmailSent
case object EmailNotResent extends ValidationEmailSent
case object ErrorResending extends ValidationEmailSent
