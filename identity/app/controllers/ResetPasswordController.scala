package controllers

import common.ImplicitControllerExecutionContext
import form.Mappings
import idapiclient.IdApiClient
import model.{ApplicationContext, IdentityPage, NoCache, ReturnJourney}
import pages.IdentityHtmlPage
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.data.validation._
import play.api.data.{Form, Forms}
import play.api.http.HttpConfiguration
import play.api.i18n.{Messages, MessagesProvider}
import play.api.mvc._
import services._
import utils.SafeLogging

import scala.concurrent.Future

class ResetPasswordController(
    api: IdApiClient,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    authenticationService: AuthenticationService,
    signInService: PlaySigninService,
    val controllerComponents: ControllerComponents,
    val httpConfiguration: HttpConfiguration,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging
    with Mappings
    with implicits.Forms {

  private val page = IdentityPage("/reset-password", "Reset Password", isFlow = true)

  private val requestPasswordResetForm = Form(
    Forms.single(
      "email-address" -> Forms.text,
    ),
  )

  private val passwordResetForm = Form(
    Forms.tuple(
      "password" -> Forms.text,
      "password-confirm" -> Forms.text,
      "email-address" -> Forms.text,
      "returnUrl" -> Forms.optional(text),
    ),
  )

  private def passwordResetFormWithConstraints(implicit
      messagesProvider: MessagesProvider,
  ): Form[(String, String, String, Option[String])] =
    Form(
      Forms.tuple(
        "password" -> idPassword
          .verifying(Constraints.nonEmpty),
        "password-confirm" -> idPassword
          .verifying(Constraints.nonEmpty),
        "email-address" -> of[String].verifying(Constraints.nonEmpty),
        "returnUrl" -> Forms.optional(text),
      ) verifying (Messages("error.passwordsMustMatch"), { f => f._1 == f._2 }),
    )

  private def clearPasswords(
      form: Form[(String, String, String, Option[String])],
  ): Form[(String, String, String, Option[String])] =
    form.copy(
      data = form.data + ("password" -> "", "password-confirm" -> ""),
    )

  def renderEmailSentConfirmation: Action[AnyContent] =
    Action { implicit request =>
      val idRequest = idRequestParser(request)
      Ok(
        IdentityHtmlPage.html(
          views.html.password.emailSent(page, idRequest, idUrlBuilder),
        )(page, request, context),
      )
    }

  def renderResetPassword(token: String, returnUrl: Option[String]): Action[AnyContent] =
    Action { implicit request =>
      val idRequest = idRequestParser(request)
      val boundForm = passwordResetForm.bindFromFlash.getOrElse(passwordResetForm)
      NoCache(
        Ok(
          IdentityHtmlPage.html(
            views.html.password.resetPassword(page, idRequest, idUrlBuilder, boundForm, token, returnUrl.getOrElse("")),
          )(page, request, context),
        ),
      )
    }

  def resetPassword(token: String, returnUrl: Option[String]): Action[AnyContent] =
    Action.async { implicit request =>
      val boundForm = passwordResetFormWithConstraints.bindFromRequest

      def onError(formWithErrors: Form[(String, String, String, Option[String])]): Future[Result] = {
        logger.info("form errors in reset password attempt")
        Future.successful {
          NoCache(
            SeeOther(routes.ResetPasswordController.renderResetPassword(token, returnUrl).url)
              .flashing(clearPasswords(formWithErrors).toFlash),
          )
        }
      }

      def onSuccess(form: (String, String, String, Option[String])): Future[Result] =
        form match {
          case (password, password_confirm, email_address, returnUrl) =>
            val idRequest = idRequestParser(request)
            val authResponse = api.resetPassword(token, password, idRequest.trackingData)
            signInService.getCookies(authResponse, true) map {
              case Left(errors) =>
                logger.info(s"reset password errors, ${errors.toString()}")
                if (errors.exists("Token expired" == _.message)) {
                  NoCache(SeeOther(idUrlBuilder.buildUrl("/reset/resend", idRequest)))
                } else {
                  val formWithError = errors.foldLeft(requestPasswordResetForm) { (form, error) =>
                    form.withError(error.context.getOrElse(""), error.description)
                  }
                  NoCache(
                    SeeOther("/reset")
                      .flashing(formWithError.toFlash),
                  )
                }

              case Right(responseCookies) =>
                logger.trace("Logging user in")
                SeeOther(routes.ResetPasswordController.renderPasswordResetConfirmation(returnUrl).url)
                  .withCookies(responseCookies: _*)
            }
        }

      boundForm.fold[Future[Result]](onError, onSuccess)
    }

  def renderPasswordResetConfirmation(returnUrl: Option[String]): Action[AnyContent] =
    Action { implicit request =>
      val returnJourney = ReturnJourney(returnUrl)
      val idRequest = idRequestParser(request)
      val userIsLoggedIn = authenticationService.userIsFullyAuthenticated(request)
      Ok(
        IdentityHtmlPage.html(
          views.html.password
            .passwordResetConfirmation(page, idRequest, idUrlBuilder, userIsLoggedIn, returnUrl, returnJourney),
        )(page, request, context),
      )
    }

}
