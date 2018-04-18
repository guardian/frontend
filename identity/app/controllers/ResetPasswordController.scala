package controllers

import common.ImplicitControllerExecutionContext
import model.{ApplicationContext, IdentityPage, NoCache}
import play.api.data.{Form, Forms}
import play.api.mvc._
import idapiclient.IdApiClient
import services._
import play.api.i18n.{Messages, MessagesProvider}
import play.api.data.validation._
import play.api.data.Forms._
import play.api.data.format.Formats._
import form.Mappings
import pages.IdentityHtmlPage
import play.api.http.HttpConfiguration
import utils.SafeLogging

import scala.concurrent.Future

class ResetPasswordController(
  api : IdApiClient,
  idRequestParser: IdRequestParser,
  idUrlBuilder: IdentityUrlBuilder,
  authenticationService: AuthenticationService,
  signInService : PlaySigninService,
  val controllerComponents: ControllerComponents,
  val httpConfiguration: HttpConfiguration
)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with SafeLogging with Mappings with implicits.Forms {

  private val page = IdentityPage("/reset-password", "Reset Password")

  private val requestPasswordResetForm = Form(
    Forms.single(
      "email-address" -> Forms.text
    )
  )

  private val requestPasswordResetFormWithConstraints = Form(
    Forms.single(
      "email-address" -> of[String].verifying(Constraints.nonEmpty)
    )
  )

  private val passwordResetForm = Form(
    Forms.tuple (
      "password" -> Forms.text,
      "password-confirm" ->  Forms.text,
      "email-address" -> Forms.text
    )
  )

  private def passwordResetFormWithConstraints(implicit messagesProvider: MessagesProvider): Form[(String, String, String)] = Form(
    Forms.tuple (
      "password" ->  idPassword
        .verifying(Constraints.nonEmpty),
      "password-confirm" ->  idPassword
        .verifying(Constraints.nonEmpty),
      "email-address" -> of[String].verifying(Constraints.nonEmpty)
    ) verifying(Messages("error.passwordsMustMatch"), { f => f._1 == f._2 }  )
  )

  private def clearPasswords(form: Form[(String, String, String)]): Form[(String, String, String)] = form.copy(
    data = form.data + ("password" -> "", "password-confirm" -> "")
  )


  def renderEmailSentConfirmation: Action[AnyContent] = Action { implicit request =>
    val idRequest = idRequestParser(request)
    Ok(IdentityHtmlPage.html(
      views.html.password.emailSent(page, idRequest, idUrlBuilder)
    )(page, request, context))
  }

  def renderResetPassword(token: String): Action[AnyContent] = Action{ implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = passwordResetForm.bindFromFlash.getOrElse(passwordResetForm)
    NoCache(Ok(
      IdentityHtmlPage.html(
        views.html.password.resetPassword(page, idRequest, idUrlBuilder, boundForm, token)
      )(page, request, context)
    ))
  }

  def resetPassword(token : String): Action[AnyContent] = Action.async { implicit request =>
    val boundForm = passwordResetFormWithConstraints.bindFromRequest

    def onError(formWithErrors: Form[(String, String, String)]): Future[Result] = {
      logger.info("form errors in reset password attempt")
      Future.successful {
        NoCache(
          SeeOther(routes.ResetPasswordController.renderResetPassword(token).url)
            .flashing(clearPasswords(formWithErrors).toFlash)
        )
      }
    }

    def onSuccess(form: (String, String, String)): Future[Result] = form match {
      case (password, password_confirm, email_address) =>

        val authResponse = api.resetPassword(token,password)
        signInService.getCookies(authResponse, true) map {
          case Left(errors) =>
            logger.info(s"reset password errors, ${errors.toString()}")
            if (errors.exists("Token expired" == _.message)) {
              val idRequest = idRequestParser(request)
              NoCache(SeeOther(idUrlBuilder.buildUrl("/reset/resend", idRequest)))
            } else {
              val formWithError = errors.foldLeft(requestPasswordResetForm) { (form, error) =>
                form.withError(error.context.getOrElse(""), error.description)
              }
              NoCache(
                SeeOther("/reset")
                  .flashing(formWithError.toFlash)
              )
            }

          case Right(responseCookies) =>
            logger.trace("Logging user in")
            SeeOther(routes.ResetPasswordController.renderPasswordResetConfirmation.url)
              .withCookies(responseCookies:_*)
        }
    }

    boundForm.fold[Future[Result]](onError, onSuccess)
  }

  def renderPasswordResetConfirmation: Action[AnyContent] = Action{ implicit request =>
    val idRequest = idRequestParser(request)
    val userIsLoggedIn = authenticationService.userIsFullyAuthenticated(request)
    Ok(IdentityHtmlPage.html(
      views.html.password.passwordResetConfirmation(page, idRequest, idUrlBuilder, userIsLoggedIn)
    )(page, request, context))
  }

  def processUpdatePasswordToken( token : String): Action[AnyContent] = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    api.userForToken(token) map {
      case Left(errors) =>
        logger.warn(s"Could not retrieve password reset request for token: $token, errors: ${errors.toString()}")
        val idRequest = idRequestParser(request)
        NoCache(SeeOther(idUrlBuilder.buildUrl("/reset/resend", idRequest)))
      case Right(user) =>
        val filledForm = passwordResetForm.fill("","", user.primaryEmailAddress)
        NoCache(SeeOther(routes.ResetPasswordController.renderResetPassword(token).url).flashing(filledForm.toFlash))
   }
  }
}
