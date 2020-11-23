package controllers

import java.net.URLEncoder

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import idapiclient.IdApiClient
import services.{AuthenticationService, IdRequestParser, IdentityUrlBuilder, PlaySigninService, ReturnUrlVerifier}
import common.ImplicitControllerExecutionContext
import utils.SafeLogging
import model.{ApplicationContext, IdentityPage}
import actions.AuthenticatedActions
import cats.data.EitherT
import cats.instances.future._
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

  def completeRegistration(): Action[AnyContent] = {
    Action.async { implicit request =>
      val page = IdentityPage("/complete-registration", "Complete Signup", isFlow = true)
      val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)

      def decryptEmail(token: Option[String]): Future[Option[String]] = {
        token match {
          case Some(token) => api.decryptEmailToken(token).map(_.toOption)
          case _ => {
            logger.error("encryptedEmail parameter was absent from complete-registration page")
            Future.successful(None)
          }
        }
      }

      decryptEmail(request.getQueryString("encryptedEmail"))
        .map(email =>
          Ok(
            IdentityHtmlPage.html(
              views.html.verificationEmailResent(
                idUrlBuilder,
                verifiedReturnUrlAsOpt,
                returnUrlVerifier.defaultReturnUrl,
                email
              ),
            )(page, request, context)
          )
        )
    }
  }

  def resendValidationEmail(token: String): Action[AnyContent] = {
    Action.async { implicit request =>
      val response = for {
        email <- EitherT(api.decryptEmailToken(token))
        user <- EitherT(api.userFromQueryParam(URLEncoder.encode(email, "UTF-8"), "emailAddress"))
        response <- EitherT(api.resendEmailValidationEmail(user.id))
      } yield response

      response.value map {
        case Left(errors) => {
          logger.error(s"Could not resend email verification email: $errors")
          InternalServerError("Internal error: Could not resend email verification email")
        }
        case Right(_) => Ok("")
      }
    }
  }
}
