package controllers.editprofile

import actions.AuthenticatedActions._
import com.gu.identity.model.{Consent, EmailNewsletters, StatusFields, User}
import idapiclient.UserUpdateDTO
import model.{IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.data.Form
import play.api.data.Forms.{mapping, nonEmptyText, single, text}
import play.api.data.validation.Constraints
import play.api.i18n.MessagesProvider
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, DiscardingCookie, Result}
import services.PlaySigninService
import utils.ConsentOrder.userWithOrderedConsents
import utils.ConsentsJourneyType.AnyConsentsJourney

import scala.concurrent.Future

object GuestPasswordForm {

  def form()(implicit messagesProvider: MessagesProvider): Form[GuestPasswordFormData] = Form(
    mapping(
        ("password", text.verifying(Constraints.nonEmpty)),
      ("token", text)
    )(GuestPasswordFormData.apply)(GuestPasswordFormData.unapply)
  )

}
case class GuestPasswordFormData(password: String, token: String)


trait ConsentsJourney
    extends EditProfileControllerComponents
    with EditProfileFormHandling {

  import authenticatedActions._

  def signinService: PlaySigninService

  def guestPasswordSet(): Action[AnyContent] = csrfCheck {
    Action.async { implicit request =>
      val form = GuestPasswordForm.form().bindFromRequest()
      form.fold(errorForm => {
        displayConsentComplete(Some(errorForm))(request)
      }, completedForm => {
        val authResponse = identityApiClient.setPasswordGuest(completedForm.password, completedForm.token)
        signinService.getCookies(authResponse, rememberMe = false).flatMap {
          case Right(cookies) =>
            Future.successful(NoCache(SeeOther(returnUrlVerifier.defaultReturnUrl).withCookies(cookies: _*).discardingCookies(DiscardingCookie("SC_GU_GUEST_PW_SET"))))
          case _ =>
            displayConsentComplete(Some(form.withError("error", "An unexpected error occurred, please try again later.")))(request)
        }
      })
    }
  }

  /** GET /consents/thank-you */
  def displayConsentsJourneyThankYou: Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageThankYou, None)

  /** GET /consents */
  def displayConsentsJourney(consentHint: Option[String] = None): Action[AnyContent] =
    displayConsentJourneyForm(ConsentJourneyPageDefault, consentHint)

  /** GET /complete-consents */
  def displayConsentComplete(guestPasswordForm: Option[Form[GuestPasswordFormData]] = None): Action[AnyContent] =
    displayConsentComplete(ConsentJourneyPageDefault, None, guestPasswordForm)

  /** POST /complete-consents */
  def submitRepermissionedFlag: Action[AnyContent] =
    csrfCheck {
      consentAuthWithIdapiUserAction.async { implicit request =>
        val returnUrlForm = Form(single("returnUrl" -> nonEmptyText))
        returnUrlForm.bindFromRequest.fold(
          formWithErrors => Future.successful(BadRequest(Json.toJson(formWithErrors.errors.toList))),
          returnUrl => {
            val newConsents = if (request.user.consents.isEmpty) Consent.defaultConsents else Consent.addNewDefaults(request.user.consents)
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

  /** Handle redirects*/
  def redirectToConsentsJourney: Action[AnyContent] = Action { implicit request =>
    Redirect(
      routes.EditProfileController.displayConsentsJourney(None),
      MOVED_PERMANENTLY)
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
    consentHint: Option[String],
    guestPasswordSetForm: Option[Form[GuestPasswordFormData]]): Action[AnyContent] =
    csrfAddToken {
      consentsRedirectAction.async { implicit request =>

        val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request) match {
          case Some(url) => if (url contains "/consents") returnUrlVerifier.defaultReturnUrl else url
          case _ => returnUrlVerifier.defaultReturnUrl
        }

        consentCompleteView(
          page,
          returnUrl,
          guestPasswordSetForm
        )
      }
    }

  private def consentCompleteView(
   page: IdentityPage,
   returnUrl : String,
   guestPasswordSetForm: Option[Form[GuestPasswordFormData]])(implicit request: AuthRequest[AnyContent]): Future[Result] = {

    newsletterService.subscriptions(request.user.id, idRequestParser(request).trackingData).map { emailFilledForm =>
      Ok(IdentityHtmlPage.html(
        views.html.completeConsents(
          idRequestParser(request),
          idUrlBuilder,
          returnUrl,
          emailFilledForm,
          guestPasswordSetForm.getOrElse(GuestPasswordForm.form()),
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

    newsletterService.subscriptions(request.user.id, idRequestParser(request).trackingData).map { emailFilledForm =>

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
          skin = None
        ))(page, request, context)
      ))

    }
  }

}
