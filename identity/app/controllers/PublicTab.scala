package controllers

import play.api.mvc._

trait PublicTab
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  /** GET /public/edit */
  def displayPublicProfileForm: Action[AnyContent] = displayForm(PublicEditProfilePage)

  /** POST /public/edit */
  def submitPublicProfileForm(): Action[AnyContent] = submitForm(PublicEditProfilePage)

}
