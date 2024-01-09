package controllers

import actions.AuthenticatedActions
import com.softwaremill.macwire._
import controllers.editprofile.EditProfileController
import form.FormComponents
import idapiclient.IdApiComponents
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services.IdentityServices

trait IdentityControllers extends IdApiComponents with IdentityServices with FormComponents {
  def wsClient: WSClient
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext

  def csrfCheck: CSRFCheck
  def csrfAddToken: CSRFAddToken

  lazy val authenticatedActions: AuthenticatedActions = wire[AuthenticatedActions]
  lazy val changePasswordController: ChangePasswordController = wire[ChangePasswordController]
  lazy val publicProfileController: PublicProfileController = wire[PublicProfileController]
  lazy val editProfileController: EditProfileController = wire[EditProfileController]
  lazy val emailVerificationController: EmailVerificationController = wire[EmailVerificationController]
  lazy val formstackController: FormstackController = wire[FormstackController]
  lazy val emailSignupController: EmailSignupController = wire[EmailSignupController]
  lazy val accountDeletionController: AccountDeletionController = wire[AccountDeletionController]
}
