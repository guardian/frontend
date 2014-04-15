package controllers

import common.ExecutionContexts
import com.google.inject.Inject
import javax.inject.Singleton
import model.{NoCache, IdentityPage}
import play.api.mvc._
import play.api.data.Form
import play.api.data.Forms._
import services._
import utils.SafeLogging
import form.Mappings
import idapiclient.IdApiClient
import play.filters.csrf.{CSRFCheck, CSRFAddToken}
import actions.AuthenticatedAction
import play.api.i18n.Messages
import scala.concurrent.Future
import idapiclient.requests.PasswordUpdate

@Singleton
class ChangePasswordController @Inject()( api: IdApiClient,
                                          authAction: AuthenticatedAction,
                                          authenticationService: AuthenticationService,
                                          idRequestParser: IdRequestParser,
                                          idUrlBuilder: IdentityUrlBuilder)
  extends Controller with ExecutionContexts with SafeLogging with Mappings {

  val page = IdentityPage("/password/change", "Change Password", "change-password")

  val passwordForm = Form(
    mapping(
      ("oldPassword", optional(idPassword)),
      ("newPassword1", idPassword),
      ("newPassword2", idPassword)
    )(PasswordFormData.apply)(PasswordFormData.unapply) verifying(
      Messages("error.passwordsMustMatch"),
      {_.passwordsMatch}
      )
  )

  def displayForm() = CSRFAddToken {
    authAction.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        api.passwordExists(request.auth) map {
          result =>
            val pwdExists = result.right.toOption exists {_ == true}
            NoCache(Ok(views.html.password.changePassword(page.tracking(idRequest), idRequest, idUrlBuilder,  passwordForm, pwdExists )))
        }
    }
  }

  def submitForm() = CSRFCheck{
    authAction.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        val boundForm = passwordForm.bindFromRequest()
        val futureFormOpt = boundForm.value map {
          data =>
            val update = PasswordUpdate(data.oldPassword, data.newPassword1)
            api.updatePassword(update, request.auth, idRequest.trackingData) map {
              case Left(errors) =>
                boundForm.withError("oldPassword", Messages("error.wrongPassword"))

              case Right(result) =>
                boundForm
            }
        }
        val futureForms = futureFormOpt getOrElse Future.successful(boundForm)
        futureForms map {
          form =>
            if(form.hasErrors){
              val pwdExists = request.getQueryString("passwordExists") exists { _.toBoolean }
              NoCache(Ok(views.html.password.changePassword(page.tracking(idRequest), idRequest, idUrlBuilder, form, pwdExists)))
            }
            else {
              val userIsLoggedIn = authenticationService.requestPresentsAuthenticationCredentials(request)
              NoCache(Ok(views.html.password.password_reset_confirmation(page, idRequest, idUrlBuilder, userIsLoggedIn)))
            }
        }
    }
  }

}

case class PasswordFormData(oldPassword: Option[String], newPassword1: String, newPassword2: String){
  def passwordsMatch = newPassword1 == newPassword2
}
