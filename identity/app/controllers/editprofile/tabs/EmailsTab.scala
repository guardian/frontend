package controllers.editprofile.tabs

import conf.Configuration
import controllers.editprofile._
import play.api.mvc.{Action, AnyContent}

trait EmailsTab extends EditProfileControllerComponents {
  private def redirectToManage(path: String): Action[AnyContent] =
    Action { implicit request =>
      logger.info(s"Request path is: ${request.path}")
      val result = Redirect(url = s"${Configuration.id.mmaUrl}/${path}", MOVED_PERMANENTLY)
      logger.info(s"Response for ${request.path} is: ${result.header.status}")
      result
    }

  /** GET /email-prefs */
  def redirectToManageEmailPrefs: Action[AnyContent] = redirectToManage("email-prefs")
}
