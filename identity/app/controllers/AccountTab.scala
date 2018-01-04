package controllers

import play.api.mvc._

trait AccountTab
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  /** GET /account/edit */
  def displayAccountForm: Action[AnyContent] = displayForm(AccountEditProfilePage)

  /** POST /account/edit */
  def submitAccountForm(): Action[AnyContent] = submitForm(AccountEditProfilePage)

}
