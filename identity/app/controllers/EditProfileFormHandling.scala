package controllers


import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.{Consent, EmailNewsletters, StatusFields, User}
import common.ImplicitControllerExecutionContext
import play.api.mvc._

import form.{AccountFormData, PrivacyFormData, ProfileFormsMapping, UserFormData}
import idapiclient.{IdApiClient, UserUpdateDTO}
import model.{ApplicationContext, IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.i18n.I18nSupport
import utils.ConsentOrder.userWithOrderedConsents
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services.{IdRequestParser, IdentityUrlBuilder, NewsletterService, ReturnUrlVerifier}
import utils.SafeLogging

import scala.concurrent.Future

trait EditProfileFormHandling extends EditProfileControllerComponents {

  import authenticatedActions._

  def displayForm(
    page: IdentityPage,
    consentsUpdated: Boolean = false,
    consentHint: Option[String] = None): Action[AnyContent] = {

    csrfAddToken {
      consentJourneyRedirectAction.async { implicit request =>
        profileFormsView(
          page = page,
          forms = ProfileForms(userWithOrderedConsents(request.user, consentHint),PublicEditProfilePage),
          request.user,
          consentsUpdated,
          consentHint
        )
      }
    }

  }

  def submitForm(page: IdentityPage): Action[AnyContent] =
    csrfCheck {
      fullAuthWithIdapiUserAction.async { implicit request =>
        val userDO = request.user
        val boundProfileForms =
          ProfileForms(userDO, activePage = page).bindFromRequestWithAddressErrorHack(request) // NOTE: only active form is bound to request data

        boundProfileForms.activeForm.fold(
          formWithErrors => profileFormsView(page, boundProfileForms, userDO),
          success = {
            case formData: AccountFormData if formData.deleteTelephone =>
              identityApiClient.deleteTelephone(userDO.auth) flatMap {
                case Left(errors) => profileFormsView(page, boundProfileForms.withErrors(errors), userDO)

                case Right(_) => {
                  val boundForms =
                    boundProfileForms.bindForms(
                      userDO.user.copy(privateFields = userDO.user.privateFields.copy(telephoneNumber = None)))

                  profileFormsView(page, boundForms, userDO)
                }
              }

            case formData: UserFormData =>
              identityApiClient.saveUser(userDO.id, formData.toUserUpdateDTO(userDO), userDO.auth) flatMap {
                case Left(idapiErrors) =>
                  logger.error(s"Failed to process ${page.id} form submission for user ${userDO.getId}: $idapiErrors")
                  profileFormsView(page, boundProfileForms.withErrors(idapiErrors), userDO)

                case Right(updatedUser) => profileFormsView(page, boundProfileForms.bindForms(updatedUser), updatedUser)
              }
          } // end of success
        ) // end fold
      } // end authActionWithUser.async
    } // end csrfCheck



  private def profileFormsView(
    page: IdentityPage,
    forms: ProfileForms,
    user: User,
    consentsUpdated: Boolean = false,
    consentHint: Option[String] = None)
    (implicit request: AuthRequest[AnyContent]): Future[Result] = {

    newsletterService.subscriptions(request.user.getId, idRequestParser(request).trackingData).map { emailFilledForm =>

      NoCache(Ok(
        IdentityHtmlPage.html(
          content = views.html.profileForms(
            page.metadata.id,
            user,
            forms,
            idRequestParser(request),
            idUrlBuilder,
            emailFilledForm,
            newsletterService.getEmailSubscriptions(emailFilledForm),
            EmailNewsletters.all,
            consentsUpdated,
            consentHint
          )
        )(page, request, context)
      ))

    }
  }

}
