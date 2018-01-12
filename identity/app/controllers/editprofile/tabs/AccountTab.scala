package controllers.editprofile.tabs

import controllers.editprofile.{AccountEditProfilePage, EditProfileControllerComponents, EditProfileFormHandling}
import play.api.mvc.{Action, AnyContent}

trait AccountTab
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  /** GET /account/edit */
  def displayAccountForm: Action[AnyContent] = displayForm(AccountEditProfilePage)

  /** POST /account/edit */
  def submitAccountForm(): Action[AnyContent] = submitForm(AccountEditProfilePage)

}
