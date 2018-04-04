package controllers.editprofile

import actions.AuthenticatedActions._
import com.gu.identity.model.{Consent, EmailNewsletters, StatusFields, User}
import idapiclient.UserUpdateDTO
import model.{IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.data.Form
import play.api.data.Forms.{nonEmptyText, single}
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, Result}
import utils.ConsentOrder.userWithOrderedConsents
import utils.ConsentsJourneyType.AnyConsentsJourney

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

  /** GET /consents/staywithus */
  def displayConsentsJourneyGdprCampaign: Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageGdprCampaign, None)

  /** GET /consents */
  def displayConsentsJourney(consentHint: Option[String] = None): Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageDefault, consentHint)

  /** GET /complete-consents */
  def displayConsentComplete: Action[AnyContent] =
    displayConsentComplete(ConsentJourneyPageDefault, None)

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
                Redirect(s"${routes.EditProfileController.displayConsentComplete().url}", Map("returnUrl" -> Seq(returnUrl)))
            }
          }
        )
      }
    }

  private def displayConsentJourneyForm(
    page: ConsentJourneyPage,
    consentHint: Option[String]): Action[AnyContent] =


      csrfAddToken {
        consentsRedirectAction.async { implicit request =>
          consentJourneyView(
            page = page,
            journey = page.journey,
            forms = ProfileForms(userWithOrderedConsents(request.user, consentHint), PublicEditProfilePage),
            request.user,
            consentHint
          )

      }
    }

  private def displayConsentComplete(
    page: ConsentJourneyPage,
    consentHint: Option[String]): Action[AnyContent] =
    csrfAddToken {
      consentsRedirectAction.async { implicit request =>

        val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request) match {
          case Some(url) => if (url contains "/consents") returnUrlVerifier.defaultReturnUrl else url
          case _ => returnUrlVerifier.defaultReturnUrl
        }

        consentCompleteView(
          page,
          returnUrl
        )
      }
    }

  private def consentCompleteView(
   page: IdentityPage,
   returnUrl : String)(implicit request: AuthRequest[AnyContent]): Future[Result] = {

    newsletterService.subscriptions(request.user.getId, idRequestParser(request).trackingData).map { emailFilledForm =>
      Ok(IdentityHtmlPage.html(
        views.html.completeConsents(
          idRequestParser(request),
          idUrlBuilder,
          returnUrl,
          emailFilledForm,
          newsletterService.getEmailSubscriptions(emailFilledForm),
          EmailNewsletters.all)
      )(page, request, context))
    }
  }

  private def consentJourneyView(
    page: IdentityPage,
    journey: AnyConsentsJourney,
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
          skin = if(page == ConsentJourneyPageGdprCampaign) Some("gdpr-oi-campaign") else None
        ))(page, request, context)
      ))

    }
  }

}
