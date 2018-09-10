package controllers.editprofile.tabs

import controllers.editprofile._
import play.api.mvc.{Action, AnyContent}

trait EmailsTab
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  import authenticatedActions._

  /** GET /email-prefs */
  def displayEmailPrefsForm(consentsUpdated: Boolean, consentHint: Option[String]): Action[AnyContent] =
    displayForm(EmailPrefsProfilePage, consentsUpdated, consentHint)

  /** GET /privacy/edit */
  def displayPrivacyFormRedirect(
    consentsUpdated: Boolean,
    consentHint: Option[String]): Action[AnyContent] =
    csrfAddToken {
      recentFullAuthWithIdapiUserAction { implicit request =>
        Redirect(
          routes.EditProfileController.displayEmailPrefsForm(consentsUpdated, consentHint),
          MOVED_PERMANENTLY)
      }
    }
}
