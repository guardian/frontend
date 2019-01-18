package controllers

import common.ImplicitControllerExecutionContext
import model.{ApplicationContext, IdentityPage, NoCache}
import play.api.mvc._
import play.api.data.{Form, Forms}
import play.api.data.Forms._
import services._
import utils.SafeLogging
import form.Mappings
import idapiclient.IdApiClient
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import actions.AuthenticatedActions
import play.api.i18n.{Messages, MessagesProvider}

import scala.concurrent.Future
import idapiclient.requests.PasswordUpdate
import pages.IdentityHtmlPage
import play.api.http.HttpConfiguration

class ChangePasswordController(
  api: IdApiClient,
  authenticatedActions: AuthenticatedActions,
  authenticationService: AuthenticationService,
  idRequestParser: IdRequestParser,
  idUrlBuilder: IdentityUrlBuilder,
  csrfCheck: CSRFCheck,
  csrfAddToken: CSRFAddToken,
  signInService: PlaySigninService,
  val controllerComponents: ControllerComponents,
  val httpConfiguration: HttpConfiguration
)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with SafeLogging with Mappings with implicits.Forms {

  import authenticatedActions.fullAuthAction

  val page = IdentityPage("/password/change", "Change Password")

  private val passwordForm = Form(
    mapping(
      ("oldPassword", optional(Forms.text)),
      ("newPassword1", Forms.text),
      ("newPassword2", Forms.text)
    )(PasswordFormData.apply)(PasswordFormData.unapply)
  )

  private def passwordFormWithConstraints(implicit messagesProvider: MessagesProvider): Form[PasswordFormData] = Form(
    mapping(
      ("oldPassword", optional(idPassword)),
      ("newPassword1", idPassword),
      ("newPassword2", idPassword)
    )(PasswordFormData.apply)(PasswordFormData.unapply) verifying(
      Messages("error.passwordsMustMatch"),
      {_.passwordsMatch}
      ) verifying(
      Messages("error.passwordMustChange"),
      {_.passwordChanged}
      )
  )

  def displayForm(): Action[AnyContent] = csrfAddToken {
    fullAuthAction.async {
      implicit request =>

        val form = passwordForm.bindFromFlash.getOrElse(passwordForm)

        val idRequest = idRequestParser(request)
        api.passwordExists(request.user.auth, idRequest.trackingData) map {
          result =>
            val pwdExists = result.right.toOption contains true
            NoCache(Ok(
                IdentityHtmlPage.html(
                  views.html.password.changePassword(page = page, idRequest = idRequest, idUrlBuilder = idUrlBuilder, passwordForm = form, passwordExists =  pwdExists)
                )(page, request, context)
            ))
        }
    }
  }

  def renderPasswordConfirmation(returnUrl: Option[String]): Action[AnyContent] = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val userIsLoggedIn = authenticationService.userIsFullyAuthenticated(request)
    NoCache(
      Ok(
        IdentityHtmlPage.html(
          views.html.password.passwordResetConfirmation(page, idRequest, idUrlBuilder, userIsLoggedIn, returnUrl, None)
        )(page, request, context)
      ))
  }

  def submitForm(): Action[AnyContent] = csrfCheck {
    fullAuthAction.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        val boundForm = passwordFormWithConstraints.bindFromRequest()

        def onError(formWithErrors: Form[PasswordFormData]): Future[Result] = {
          logger.info("form errors in change password attempt")
          Future.successful(
            NoCache(
              SeeOther(routes.ChangePasswordController.displayForm().url).flashing(clearPasswords(formWithErrors).toFlash)
            )
          )
        }

        def onSuccess(form: PasswordFormData): Future[Result] = {
            val update = PasswordUpdate(form.oldPassword, form.newPassword1)
            val authResponse = api.updatePassword(update, request.user.auth, idRequest.trackingData)

            signInService.getCookies(authResponse, true) map {
              case Left(errors) =>
                val formWithErrors = errors.foldLeft(boundForm){ (form, error) =>
                  form.withError(error.context.getOrElse(""), error.description)
                }
                NoCache(
                  SeeOther(routes.ChangePasswordController.displayForm().url).flashing(clearPasswords(formWithErrors).toFlash)
                )
              case Right(cookies) =>
                NoCache(SeeOther(routes.ChangePasswordController.renderPasswordConfirmation(None).url)).withCookies(cookies:_*)
            }
        }

        boundForm.fold[Future[Result]](onError, onSuccess)
    }
  }

  private def clearPasswords(formWithPasswords: Form[PasswordFormData]) = formWithPasswords.copy(data = Map.empty)

}

case class PasswordFormData(oldPassword: Option[String], newPassword1: String, newPassword2: String){
  lazy val passwordsMatch = newPassword1 == newPassword2
  lazy val passwordChanged = oldPassword map {_ != newPassword1} getOrElse true
}
