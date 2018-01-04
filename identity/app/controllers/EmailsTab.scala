package controllers

import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.{Consent, EmailNewsletters, StatusFields, User}
import play.api.mvc._
import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.Json
import conf.switches.Switches.IdentityAllowAccessToGdprJourneyPageSwitch
import form.PrivacyFormData
import idapiclient.UserUpdateDTO
import model.{IdentityPage, NoCache}
import pages.IdentityHtmlPage
import utils.ConsentOrder.userWithOrderedConsents
import scala.concurrent.Future

trait EmailsTab
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  import authenticatedActions._

  /** GET /consents/all */
  def displayConsentsJourneyAll(
    consentHint: Option[String] = None,
    newsletterHint: Option[String] = None): Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageAll, consentHint)

  /** GET /consents/newsletters */
  def displayConsentsJourneyNewsletters: Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageNewsletters, None)

  /** GET /consents */
  def displayConsentsJourney(consentHint: Option[String] = None): Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageDefault, consentHint)

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

  /** POST /complete-consents */
  def submitRepermissionedFlag: Action[AnyContent] =
    csrfCheck {
      consentAuthWithIdapiUserAction.async { implicit request =>
        val returnUrlForm = Form(single("returnUrl" -> nonEmptyText))
        returnUrlForm.bindFromRequest.fold(
          formWithErrors => Future.successful(BadRequest(Json.toJson(formWithErrors.errors.toList))),
          returnUrl => {
            val newConsents = if (request.user.consents.isEmpty) Consent.defaultConsents else request.user.consents
            identityApiClient.saveUser(
              request.user.id,
              UserUpdateDTO(consents = Some(newConsents), statusFields = Some(StatusFields(hasRepermissioned = Some(true)))),
              request.user.auth
            ).map {
              case Left(idapiErrors) =>
                logger.error(s"Failed to set hasRepermissioned flag for user ${request.user.id}: $idapiErrors")
                InternalServerError(Json.toJson(idapiErrors))

              case Right(updatedUser) =>
                logger.info(s"Successfully set hasRepermissioned flag for user ${request.user.id}")
                SeeOther(returnUrl)
            }
          }
        )
      }
    }

  private def displayConsentJourneyForm(
    page: ConsentJourneyPage,
    consentHint: Option[String]): Action[AnyContent] =

    if (IdentityAllowAccessToGdprJourneyPageSwitch.isSwitchedOff) {
      recentFullAuthWithIdapiUserAction { implicit request =>
        NotFound(views.html.errors._404())
      }
    } else {
      csrfAddToken {
        consentAuthWithIdapiUserAction.async { implicit request =>
          consentJourneyView(
            page = page,
            journey = page.journey,
            forms = ProfileForms(userWithOrderedConsents(request.user, consentHint), PublicEditProfilePage),
            request.user,
            consentHint
          )
        }
      }
    }

  private def consentJourneyView(
    page: IdentityPage,
    journey: String,
    forms: ProfileForms,
    user: User,
    consentHint: Option[String])(implicit request: AuthRequest[AnyContent]): Future[Result] = {

    newsletterService.subscriptions(request.user.getId, idRequestParser(request).trackingData).map { emailFilledForm =>

      NoCache(Ok(
        IdentityHtmlPage.html(content = views.html.consentJourney(
          user,
          forms,
          journey,
          returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl),
          idRequestParser(request),
          idUrlBuilder,
          emailFilledForm,
          newsletterService.getEmailSubscriptions(emailFilledForm),
          EmailNewsletters.all,
          consentHint,
        ))(page, request, context)
      ))

    }
  }

}
