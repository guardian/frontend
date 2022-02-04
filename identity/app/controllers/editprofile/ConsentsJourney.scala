package controllers.editprofile

import actions.AuthenticatedActions._
import com.gu.identity.model.{Consent, User}
import idapiclient.UserUpdateDTO
import model.{IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.data.Form
import play.api.data.Forms.{nonEmptyText, single}
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, Result}
import services.PlaySigninService
import services.newsletters.NewsletterSignupAgent
import utils.ConsentOrder.userWithOrderedConsents
import utils.ConsentsJourneyType.AnyConsentsJourney

import scala.concurrent.Future

trait ConsentsJourney extends EditProfileControllerComponents {

  import authenticatedActions._

  def signinService: PlaySigninService

  def newsletterSignupAgent: NewsletterSignupAgent

  /** GET /consents/thank-you */
  def displayConsentsJourneyThankYou: Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageThankYou, None)

  /** GET /complete-consents */
  def displayConsentComplete(): Action[AnyContent] =
    displayConsentComplete(ConsentJourneyPageDefault, None)

  /** POST /complete-consents */
  def completeConsents: Action[AnyContent] =
    csrfCheck {
      consentAuthWithIdapiUserAction.async { implicit request =>
        val returnUrlForm = Form(single("returnUrl" -> nonEmptyText))
        returnUrlForm.bindFromRequest.fold(
          formWithErrors => Future.successful(BadRequest(Json.toJson(formWithErrors.errors.toList))),
          returnUrl => {
            val newConsents =
              if (request.user.consents.isEmpty) Consent.defaultConsents
              else Consent.addNewDefaults(request.user.consents)
            identityApiClient
              .saveUser(
                request.user.id,
                UserUpdateDTO(
                  consents = Some(newConsents),
                ),
                request.user.auth,
              )
              .map {
                case Left(idapiErrors) =>
                  logger.error(s"Failed to set save user consents ${request.user.id}: $idapiErrors")
                  InternalServerError(Json.toJson(idapiErrors))

                case Right(updatedUser) =>
                  logger.info(s"Successfully set consents for user ${request.user.id}")
                  Redirect(
                    s"${routes.EditProfileController.displayConsentComplete().url}",
                    Map("returnUrl" -> Seq(returnUrl)),
                  )
              }
          },
        )
      }
    }

  private def displayConsentJourneyForm(page: ConsentJourneyPage, consentHint: Option[String]): Action[AnyContent] =
    csrfAddToken {
      consentAuthWithIdapiUserWithEmailValidation.async { implicit request =>
        consentJourneyView(
          page = page,
          journey = page.journey,
          forms = ProfileForms(userWithOrderedConsents(request.user, consentHint), PublicEditProfilePage),
          request.user,
          consentHint,
        )

      }
    }

  private def displayConsentComplete(
      page: ConsentJourneyPage,
      consentHint: Option[String],
  ): Action[AnyContent] =
    csrfAddToken {
      consentAuthWithIdapiUserWithEmailValidation.async { implicit request =>
        val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request) match {
          case Some(url) => if (url contains "/consents") returnUrlVerifier.defaultReturnUrl else url
          case _         => returnUrlVerifier.defaultReturnUrl
        }

        consentCompleteView(
          page,
          request.user,
          returnUrl,
        )
      }
    }

  private def newsletters() = {
    newsletterSignupAgent
      .getNewsletters()
      .left
      .map { error =>
        logger.error(s"ConsentsJourney newsletters not available $error")
        Nil
      }
      .merge
  }

  private def consentCompleteView(
      page: IdentityPage,
      user: User,
      returnUrl: String,
  )(implicit request: AuthRequest[AnyContent]): Future[Result] = {

    newsletterService.subscriptions(request.user.id, idRequestParser(request).trackingData).map { emailFilledForm =>
      Ok(
        IdentityHtmlPage.html(
          views.html.completeConsents(
            idRequestParser(request),
            idUrlBuilder,
            returnUrl,
            user.primaryEmailAddress,
            emailFilledForm,
            newsletterService.getEmailSubscriptions(emailFilledForm),
            newsletters(),
          ),
        )(page, request, context),
      )
    }
  }

  private def consentJourneyView(
      page: IdentityPage,
      journey: AnyConsentsJourney,
      forms: ProfileForms,
      user: User,
      consentHint: Option[String],
  )(implicit request: AuthRequest[AnyContent]): Future[Result] = {

    newsletterService.subscriptions(request.user.id, idRequestParser(request).trackingData).map { emailFilledForm =>
      NoCache(
        Ok(
          IdentityHtmlPage.html(content =
            views.html.consentJourney(
              user,
              forms,
              journey,
              returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl),
              idRequestParser(request),
              idUrlBuilder,
              emailFilledForm,
              newsletterService.getEmailSubscriptions(emailFilledForm),
              newsletters(),
              consentHint,
              skin = None,
            ),
          )(page, request, context),
        ),
      )

    }
  }

}
