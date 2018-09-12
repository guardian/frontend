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

  /** GET /contribution/recurring/edit */
  def displayRecurringContributionForm: Action[AnyContent] = displayForm(recurringContributionPage)

  /** GET /digitalpack/edit */
  def displayDigitalPackForm: Action[AnyContent] = displayForm(DigiPackEditProfilePage)

}
