package controllers.editprofile.tabs

import conf.Configuration
import controllers.editprofile.{EditProfileControllerComponents}
import play.api.mvc.{Action, AnyContent}

trait PublicTab extends EditProfileControllerComponents {

  private def redirectToManage(path: String): Action[AnyContent] =
    Action { implicit request =>
      logger.info(s"Request path is: ${request.path}")
      val result = Redirect(url = s"${Configuration.id.mmaUrl}/${path}", MOVED_PERMANENTLY)
      logger.info(s"Response for ${request.path} is: ${result.header.status}")
      result
    }

  /** GET /public/edit */
  def redirectToManagePublicSettings: Action[AnyContent] = redirectToManage("public-settings")

}
