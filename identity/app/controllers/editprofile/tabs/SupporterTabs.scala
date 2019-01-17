package controllers.editprofile.tabs

import controllers.editprofile._
import play.api.mvc.{Action, AnyContent}

/**
  * DigiPack, Mebership, Contributions tabs
  */
trait SupporterTabs
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  /** Redirect /membership/edit to manage.theguardian.com/membership */
  def redirectToManageMembership: Action[AnyContent] = Action { implicit request =>
    Redirect(
      url = "https://manage.theguardian.com/membership",
      MOVED_PERMANENTLY)
  }

  /** Redirect /contribution/recurring/edit to manage.theguardian.com/contributions */
  def redirectToManageContributions: Action[AnyContent] = Action { implicit request =>
    Redirect(
      url = "https://manage.theguardian.com/contributions",
      MOVED_PERMANENTLY)
  }

  /** Redirect /digitalpack/edit to manage.theguardian.com/digitalpack */
  def redirectToManageDigitalPack: Action[AnyContent] = Action { implicit request =>
    Redirect(
      url = "https://manage.theguardian.com/digitalpack",
      MOVED_PERMANENTLY)
  }

}
