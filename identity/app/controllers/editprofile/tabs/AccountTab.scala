package controllers.editprofile.tabs

import conf.Configuration
import controllers.editprofile.EditProfileControllerComponents
import play.api.mvc.{Action, AnyContent}

trait AccountTab extends EditProfileControllerComponents {

  private def redirectToManage(path: String): Action[AnyContent] =
    Action { implicit request =>
      Redirect(url = s"${Configuration.id.mmaUrl}/${path}", MOVED_PERMANENTLY)
    }

  /** GET /account/edit */
  def redirectToManageAccountSettings: Action[AnyContent] = redirectToManage("account-settings")

}
