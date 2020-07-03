package controllers.editprofile

import actions.AuthenticatedActions.AuthRequest
import com.gu.i18n.CountryGroup
import com.gu.identity.model.{EmailNewsletters, User}
import form.{AccountFormData, UserFormData}
import model.{IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.data.Form
import play.api.mvc.{Action, AnyContent, Result}
import services.EmailPrefsData
import utils.ConsentOrder.userWithOrderedConsents

import scala.concurrent.Future

trait EditProfileFormHandling extends EditProfileControllerComponents {

  import authenticatedActions._

  def displayForm(
    page: IdentityPage,
    consentsUpdated: Boolean = false,
    consentHint: Option[String] = None,
    emailValidationRequired: Boolean = false
  ): Action[AnyContent] = {

    def authAction =
      if (emailValidationRequired)
        recentFullAuthWithIdapiUserAction andThen emailValidationFilter
      else
        recentFullAuthWithIdapiUserAction


    csrfAddToken {
      authAction.async { implicit request =>
        val user = {
          val originalUser = request.user
          val originalUserUser = originalUser.user
          val originalPrivateFields = originalUserUser.privateFields

          val country = (for {
            s <- originalPrivateFields.country
            c <- CountryGroup.byOptimisticCountryNameOrCode(s)
          } yield c.name) orElse originalPrivateFields.country

          val billingCountry = (for {
            s <- originalPrivateFields.billingCountry
            c <- CountryGroup.byOptimisticCountryNameOrCode(s)
          } yield c.name) orElse originalPrivateFields.billingCountry

          val privateFields = originalPrivateFields.copy(
            country = country, billingCountry = billingCountry
          )

          val userUser = originalUserUser.copy(privateFields = privateFields)
          originalUser.copy(user = userUser)

        }

        profileFormsView(
          page = page,
          forms = ProfileForms(userWithOrderedConsents(user, consentHint), PublicEditProfilePage),
          user,
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
                  logger.error(s"Failed to process ${page.id} form submission for user ${userDO.id}: $idapiErrors")
                  profileFormsView(page, boundProfileForms.withErrors(idapiErrors), userDO)

                case Right(updatedUser) =>
                  val userChangedEmail: Option[String] = formData.toUserUpdateDTO(userDO).primaryEmailAddress
                  profileFormsView(page, boundProfileForms.bindForms(updatedUser), updatedUser, changedEmail = userChangedEmail)
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
    consentHint: Option[String] = None,
    changedEmail: Option[String] = None)
    (implicit request: AuthRequest[AnyContent]): Future[Result] = {

    val emailFilledForm: Future[Form[EmailPrefsData]] =
      newsletterService.subscriptions(request.user.id, idRequestParser(request).trackingData)

    emailFilledForm.map { emailFilledForm =>
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
            consentHint,
            changedEmail
          )
        )(page, request, context)
      ))
    }
  }

}
