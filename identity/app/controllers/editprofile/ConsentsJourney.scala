package controllers.editprofile

import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.{Consent, EmailNewsletters, StatusFields, User}
import conf.switches.Switches.IdentityAllowAccessToGdprJourneyPageSwitch
import idapiclient.UserUpdateDTO
import model.{IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.data.Form
import play.api.data.Forms.{nonEmptyText, single}
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, Result}
import utils.ConsentOrder.userWithOrderedConsents
import scala.concurrent.Future

trait ConsentsJourney
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  import authenticatedActions._

  /** GET /consents/newsletters */
  def displayConsentsJourneyNewsletters: Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageNewsletters, None)

  /** GET /consents/thank-you */
  def displayConsentsJourneyThankYou: Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageThankYou, None)

  /** GET /consents */
  def displayConsentsJourney(consentHint: Option[String] = None): Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageDefault, consentHint)

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
