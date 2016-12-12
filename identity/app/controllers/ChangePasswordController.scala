package controllers

import common.ExecutionContexts
import model.{NoCache, IdentityPage}
import play.api.mvc._
import play.api.data.{Form, Forms}
import play.api.data.Forms._
import services._
import utils.SafeLogging
import form.Mappings
import idapiclient.IdApiClient
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import actions.AuthenticatedActions
import play.api.i18n.{I18nSupport, Messages, MessagesApi}
import play.api.libs.crypto.CryptoConfig
import play.api.Environment
import scala.concurrent.Future
import idapiclient.requests.PasswordUpdate

class ChangePasswordController( api: IdApiClient,
                                authenticatedActions: AuthenticatedActions,
                                authenticationService: AuthenticationService,
                                idRequestParser: IdRequestParser,
                                idUrlBuilder: IdentityUrlBuilder,
                                val messagesApi: MessagesApi,
                                csrfCheck: CSRFCheck,
                                csrfAddToken: CSRFAddToken,
                                val cryptoConfig: CryptoConfig)(implicit env: Environment)
  extends Controller with ExecutionContexts with SafeLogging with Mappings with implicits.Forms with I18nSupport{

  import authenticatedActions.authAction

  val page = IdentityPage("/password/change", "Change Password")

  val passwordForm = Form(
    mapping(
      ("oldPassword", optional(Forms.text)),
      ("newPassword1", Forms.text),
      ("newPassword2", Forms.text)
    )(PasswordFormData.apply)(PasswordFormData.unapply)
  )

  val passwordFormWithConstraints = Form(
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

  def displayForm() = csrfAddToken.apply {
    authAction.async {
      implicit request =>

        val form = passwordForm.bindFromFlash.getOrElse(passwordForm)

        val idRequest = idRequestParser(request)
        api.passwordExists(request.user.auth) map {
          result =>
            val pwdExists = result.right.toOption exists {_ == true}
            NoCache(Ok(views.html.password.changePassword(page = page, idRequest = idRequest, idUrlBuilder = idUrlBuilder, passwordForm = form, passwordExists =  pwdExists)))
        }
    }
  }

  def renderPasswordConfirmation = Action{ implicit request =>
    val idRequest = idRequestParser(request)
    val userIsLoggedIn = authenticationService.requestPresentsAuthenticationCredentials(request)
    NoCache(Ok(views.html.password.passwordResetConfirmation(page, idRequest, idUrlBuilder, userIsLoggedIn)))
  }

  def submitForm() = csrfCheck {
    authAction.async {
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
            val userIsLoggedIn = authenticationService.requestPresentsAuthenticationCredentials(request)
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
