package controllers.editprofile.tabs

import conf.Configuration
import controllers.editprofile._
import play.api.mvc.{Action, AnyContent}

/** DigiPack, Mebership, Contributions tabs
  */
trait SupporterTabs extends EditProfileControllerComponents {

  private def redirectToManage(path: String): Action[AnyContent] =
    Action { implicit request =>
      Redirect(url = s"${Configuration.id.mmaUrl}/${path}", MOVED_PERMANENTLY)
    }

  /** Redirect /membership/edit to manage.theguardian.com/membership */
  def redirectToManageMembership: Action[AnyContent] = redirectToManage("membership")

  /** Redirect /contribution/recurring/edit to manage.theguardian.com/contributions */
  def redirectToManageContributions: Action[AnyContent] = redirectToManage("contributions")

  /** Redirect /digitalpack/edit to manage.theguardian.com/digitalpack */
  def redirectToManageSubscriptions: Action[AnyContent] = redirectToManage("subscriptions")

}
