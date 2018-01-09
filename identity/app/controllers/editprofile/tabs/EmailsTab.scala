package controllers.editprofile.tabs

import controllers.editprofile._
import form.PrivacyFormData
import play.api.data.Form
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent}
import scala.concurrent.Future

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

  /** POST /email-prefs */
  def saveEmailPreferencesAjax: Action[AnyContent] =
    csrfCheck {
      fullAuthWithIdapiUserAction.async { implicit request =>
        newsletterService.savePreferences().map { form  =>
          if (form.hasErrors) {
            val errorsAsJson = Json.toJson(
              form.errors.groupBy(_.key).map { case (key, errors) =>
                val nonEmptyKey = if (key.isEmpty) "global" else key
                (nonEmptyKey, errors.map(e => play.api.i18n.Messages(e.message, e.args: _*)))
              }
            )
            Forbidden(errorsAsJson)
          } else {
            Ok("updated")
          }
        }
      }
    }

  /** POST /privacy/edit-ajax */
  def saveConsentPreferencesAjax: Action[AnyContent] =
    csrfCheck {
      consentAuthWithIdapiUserAction.async { implicit request =>
        val userDO = request.user
        val marketingConsentForm: Form[PrivacyFormData] = Form(profileFormsMapping.privacyMapping.formMapping)

        marketingConsentForm.bindFromRequest.fold(
          formWithErrors => {
            val formBindingErrorsJson = Json.toJson(formWithErrors.errors.toList)
            logger.error(s"Failed to submit marketing consent form for user ${userDO.user.getId}: $formBindingErrorsJson")
            Future(BadRequest(formBindingErrorsJson))
          },

          privacyFormData => {
            identityApiClient.saveUser(userDO.id, privacyFormData.toUserUpdateDTOAjax(userDO), userDO.auth) map {
              case Left(idapiErrors) =>
                logger.error(s"Failed to process marketing consent form submission for user ${userDO.getId}: $idapiErrors")
                InternalServerError(Json.toJson(idapiErrors))

              case Right(updatedUser) =>
                val successMsg = s"Successfully updated marketing consent for user ${userDO.getId}"
                logger.info(successMsg)
                Ok(successMsg)
            }
          }
        ) // end bindFromRequest.fold(
      } // end authActionWithUser
    } // end csrfCheck

  /** POST /privacy/edit */
  def saveConsentPreferences: Action[AnyContent] = submitForm(EmailPrefsProfilePage)

}
