package controllers

import actions.AuthenticatedActions
import com.softwaremill.macwire._
import form.FormComponents
import formstack.FormStackComponents
import idapiclient.IdApiComponents
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services.IdentityServices

trait IdentityControllers extends IdApiComponents
  with IdentityServices
  with FormStackComponents
  with FormComponents {
  def wsClient: WSClient
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext

  def csrfCheck: CSRFCheck
  def csrfAddToken: CSRFAddToken

  lazy val authenticatedActions = wire[AuthenticatedActions]
  lazy val changePasswordController = wire[ChangePasswordController]
  lazy val reauthenticationController = wire[ReauthenticationController]
  lazy val resetPasswordController = wire[ResetPasswordController]
  lazy val publicProfileController = wire[PublicProfileController]
  lazy val editProfileController = wire[EditProfileController]
  lazy val emailVerificationController = wire[EmailVerificationController]
  lazy val formstackController = wire[FormstackController]
  lazy val exactTargetController = wire[ExactTargetController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val accountDeletionController = wire[AccountDeletionController]
}
