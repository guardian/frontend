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
        api.passwordExists(request.user.auth) map {
          result =>
            val pwdExists = result.right.toOption exists {_ == true}
            NoCache(Ok(
                IdentityHtmlPage.html(
                  views.html.password.changePassword(page = page, idRequest = idRequest, idUrlBuilder = idUrlBuilder, passwordForm = form, passwordExists =  pwdExists)
                )(page, request, context)
            ))
        }
    }
  }

  def renderPasswordConfirmation: Action[AnyContent] = Action{ implicit request =>
    val idRequest = idRequestParser(request)
    val userIsLoggedIn = authenticationService.userIsFullyAuthenticated(request)
    NoCache(Ok(
      IdentityHtmlPage.html(
        views.html.password.passwordResetConfirmation(page, idRequest, idUrlBuilder, userIsLoggedIn)
      )(page, request, context)
    ))
  }

  def submitForm(): Action[AnyContent] = csrfCheck {
    fullAuthAction.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        val boundForm = passwordFormWithConstraints.bindFromRequest()
        val futureFormOpt = boundForm.value map {
          data =>
            val update = PasswordUpdate(data.oldPassword, data.newPassword1)
            api.updatePassword(update, request.user.auth, idRequest.trackingData) map {
              case Left(errors) =>
                boundForm.withError("oldPassword", Messages("error.wrongPassword"))

              case Right(result) =>
                boundForm
            }
        }

        val futureForms = futureFormOpt getOrElse Future.successful(boundForm)
        futureForms map { form =>
          if(form.hasErrors){
            val pwdExists = request.getQueryString("passwordExists") exists { _.toBoolean }
            NoCache(
              SeeOther(routes.ChangePasswordController.displayForm().url).flashing(clearPasswords(form).toFlash)
            )
          } else {
            val userIsLoggedIn = authenticationService.userIsFullyAuthenticated(request)
            NoCache(SeeOther(routes.ChangePasswordController.renderPasswordConfirmation().url))
          }
        }
    }
  }

  private def clearPasswords(formWithPasswords: Form[PasswordFormData]) = formWithPasswords.copy(data = Map.empty)

}

case class PasswordFormData(oldPassword: Option[String], newPassword1: String, newPassword2: String){
  lazy val passwordsMatch = newPassword1 == newPassword2
  lazy val passwordChanged = oldPassword map {_ != newPassword1} getOrElse true
}
