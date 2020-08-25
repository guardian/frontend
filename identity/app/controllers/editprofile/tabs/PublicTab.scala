package controllers.editprofile.tabs

import conf.Configuration
import controllers.editprofile.{EditProfileControllerComponents, EditProfileFormHandling, PublicEditProfilePage}
import play.api.mvc.{Action, AnyContent}

trait PublicTab extends EditProfileControllerComponents with EditProfileFormHandling {

  private def redirectToManage(path: String): Action[AnyContent] =
    Action { implicit request =>
      Redirect(url = s"${Configuration.id.mmaUrl}/${path}", MOVED_PERMANENTLY)
    }

  /** GET /public/edit */
  def redirectToPublicSettings: Action[AnyContent] = redirectToManage("public-settings")

}
