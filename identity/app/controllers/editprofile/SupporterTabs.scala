package controllers.editprofile

import play.api.mvc.{Action, AnyContent}

/**
  * DigiPack, Mebership, Contributions tabs
  */
trait SupporterTabs
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  /** GET /membership/edit */
  def displayMembershipForm: Action[AnyContent] = displayForm(MembershipEditProfilePage)

  /** GET /contribution/recurring/edit */
  def displayRecurringContributionForm: Action[AnyContent] = displayForm(recurringContributionPage)

  /** GET /digitalpack/edit */
  def displayDigitalPackForm: Action[AnyContent] = displayForm(DigiPackEditProfilePage)

}
