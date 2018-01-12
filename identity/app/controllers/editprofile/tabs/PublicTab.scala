package controllers.editprofile.tabs

import controllers.editprofile.{EditProfileControllerComponents, EditProfileFormHandling, PublicEditProfilePage}
import play.api.mvc.{Action, AnyContent}

trait PublicTab
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  /** GET /public/edit */
  def displayPublicProfileForm: Action[AnyContent] = displayForm(PublicEditProfilePage)

  /** POST /public/edit */
  def submitPublicProfileForm(): Action[AnyContent] = submitForm(PublicEditProfilePage)

}
