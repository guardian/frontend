package controllers.editprofile.tabs

import conf.Configuration
import controllers.editprofile._
import play.api.mvc.{Action, AnyContent}

trait EmailsTab extends EditProfileControllerComponents {

  import authenticatedActions._

  val emailFilter = emailValidationFilter

  private def redirectToManage(path: String): Action[AnyContent] =
    Action { implicit request =>
      Redirect(url = s"${Configuration.id.mmaUrl}/${path}", MOVED_PERMANENTLY)
    }

  /** GET /email-prefs */
  def redirectToManageEmailPrefs: Action[AnyContent] = redirectToManage("email-prefs")
}
