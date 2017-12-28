package controllers

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.{Consent, EmailNewsletters, StatusFields, User}
import common.ImplicitControllerExecutionContext
import form._
import idapiclient.responses.Error
import idapiclient.{IdApiClient, UserUpdateDTO}
import model._
import play.api.data.Form
import play.api.data.Forms._
import play.api.i18n.{I18nSupport, MessagesProvider}
import play.api.libs.json.Json
import play.api.mvc._
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services.{IdRequestParser, IdentityUrlBuilder, ReturnUrlVerifier, _}
import utils.SafeLogging
import utils.ConsentOrder._

import scala.concurrent.Future
import conf.switches.Switches.IdentityAllowAccessToGdprJourneyPageSwitch
import play.api.http.HttpConfiguration
import pages.IdentityHtmlPage

object PublicEditProfilePage extends IdentityPage("/public/edit", "Edit Public Profile")
object AccountEditProfilePage extends IdentityPage("/account/edit", "Edit Account Details")
object EmailPrefsProfilePage extends IdentityPage("/email-prefs", "Emails")
object MembershipEditProfilePage extends IdentityPage("/membership/edit", "Membership")
object recurringContributionPage extends IdentityPage("/contribution/recurring/edit", "Contributions")
object DigiPackEditProfilePage extends IdentityPage("/digitalpack/edit", "Digital Pack")

sealed abstract class ConsentJourneyPage(id: String, val journey: String) extends IdentityPage(id, "Consent", isFlow = true)
object ConsentJourneyPageAll extends ConsentJourneyPage("/consents/all", "all")
object ConsentJourneyPageNewsletters extends ConsentJourneyPage("/consents/newsletters", "newsletters")
object ConsentJourneyPageDefault extends ConsentJourneyPage("/consents", "default")

class EditProfileController(
    idUrlBuilder: IdentityUrlBuilder,
    authenticatedActions: AuthenticatedActions,
    identityApiClient: IdApiClient,
    idRequestParser: IdRequestParser,
    csrfCheck: CSRFCheck,
    csrfAddToken: CSRFAddToken,
    returnUrlVerifier: ReturnUrlVerifier,
    implicit val profileFormsMapping: ProfileFormsMapping,
    val controllerComponents: ControllerComponents,
    newsletterService: NewsletterService,
    val httpConfiguration: HttpConfiguration)
    (implicit context: ApplicationContext)
  extends BaseController
  with ImplicitControllerExecutionContext
  with SafeLogging
  with I18nSupport
  with implicits.Forms {

  import authenticatedActions._

  def displayPublicProfileForm: Action[AnyContent] = displayForm(PublicEditProfilePage)
  def displayAccountForm: Action[AnyContent] = displayForm(AccountEditProfilePage)
  def displayMembershipForm: Action[AnyContent] = displayForm(MembershipEditProfilePage)
  def displayRecurringContributionForm: Action[AnyContent] = displayForm(recurringContributionPage)
  def displayDigitalPackForm: Action[AnyContent] = displayForm(DigiPackEditProfilePage)

  def displayConsentsJourneyAll(consentHint: Option[String] = None, newsletterHint: Option[String] = None): Action[AnyContent] = displayConsentJourneyForm(ConsentJourneyPageAll, consentHint)
  def displayConsentsJourneyNewsletters: Action[AnyContent] = displayConsentJourneyForm(ConsentJourneyPageNewsletters, None)
  def displayConsentsJourney(consentHint: Option[String] = None): Action[AnyContent] = displayConsentJourneyForm(ConsentJourneyPageDefault, consentHint)

  def displayEmailPrefsForm(consentsUpdated: Boolean, consentHint: Option[String]): Action[AnyContent] =
    displayForm(EmailPrefsProfilePage, consentsUpdated, consentHint)

  def displayConsentJourneyForm(page: ConsentJourneyPage, consentHint: Option[String]): Action[AnyContent] =
    if (IdentityAllowAccessToGdprJourneyPageSwitch.isSwitchedOff) {
      recentlyAuthenticated { implicit request =>
        NotFound(views.html.errors._404())
      }
    } else {
      csrfAddToken {
        authWithRPCookie.async { implicit request =>
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

  def displayPrivacyFormRedirect(consentsUpdated: Boolean, consentHint: Option[String]): Action[AnyContent] = csrfAddToken {
    recentlyAuthenticated { implicit request =>
      Redirect(routes.EditProfileController.displayEmailPrefsForm(consentsUpdated, consentHint), MOVED_PERMANENTLY)
    }
  }

  def submitPublicProfileForm(): Action[AnyContent] = submitForm(PublicEditProfilePage)
  def submitAccountForm(): Action[AnyContent] = submitForm(AccountEditProfilePage)

  def saveEmailPreferencesAjax: Action[AnyContent] =
    csrfCheck {
      authActionWithUser.async { implicit request =>
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

  def saveConsentPreferencesAjax: Action[AnyContent] =
    csrfCheck {
      authWithRPCookie.async { implicit request =>
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

  def saveConsentPreferences: Action[AnyContent] = submitForm(EmailPrefsProfilePage)

  def submitRepermissionedFlag: Action[AnyContent] =
    csrfCheck {
      authWithRPCookie.async { implicit request =>
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

  private def displayForm(
      page: IdentityPage,
      consentsUpdated: Boolean = false,
      consentHint: Option[String] = None) = {

    csrfAddToken {
      authWithConsentRedirectAction.async { implicit request =>
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

  private def submitForm(page: IdentityPage): Action[AnyContent] =
    csrfCheck {
      authActionWithUser.async { implicit request =>
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

/**
  * Holds all Edit Profile forms and designates which one is user currently viewing
  *
  * @param publicForm   /public/edit
  * @param accountForm  /account/edit
  * @param privacyForm  /privacy/edit
  * @param activePage   which page is user currently viewing and hence which form
  * @param profileFormsMapping Case class with mappings for all the forms
  */
case class ProfileForms(
    publicForm: Form[ProfileFormData],
    accountForm: Form[AccountFormData],
    privacyForm: Form[PrivacyFormData],
    activePage: IdentityPage)(implicit profileFormsMapping: ProfileFormsMapping) {

  lazy val activeForm = activePage match {
    case PublicEditProfilePage => publicForm
    case AccountEditProfilePage => accountForm
    case EmailPrefsProfilePage => privacyForm
    case page => throw new RuntimeException(s"Unexpected page $page")
  }

  private lazy val activeMapping = activePage match {
    case PublicEditProfilePage => profileFormsMapping.profileMapping
    case AccountEditProfilePage => profileFormsMapping.accountDetailsMapping
    case EmailPrefsProfilePage => profileFormsMapping.privacyMapping
    case page => throw new RuntimeException(s"Unexpected page $page")
  }

  /** Fills all Edit Profile forms (Public, Account, Privacy) with the provided User value */
  def bindForms(user: User)(implicit messagesProvider: MessagesProvider): ProfileForms = {
    copy(
      publicForm = profileFormsMapping.profileMapping.fillForm(user),
      accountForm = profileFormsMapping.accountDetailsMapping.fillForm(user),
      privacyForm = profileFormsMapping.privacyMapping.fillForm(user)
    )
  }

  /**
    * Binds request data to currently active profile form, and re-maps address error to different key.
    * Note that other profile forms remain unchanged, which means they remain bound bound to
    * "old user form api" instance.
    */
  def bindFromRequestWithAddressErrorHack(implicit request: Request[_]): ProfileForms = transform {
    form =>
      // Hack to get the postcode error into the correct context.
      val boundForm = form.bindFromRequest()
      boundForm.error("address") map {
        e =>
          boundForm.withError(e.copy(key = "address.postcode"))
      } getOrElse boundForm
  }

  /** Adds errors to the form */
  def withErrors(idapiErrors: List[Error]): ProfileForms = {
    transform{
      form =>
        idapiErrors.foldLeft(form){
          (formWithErrors, idapiError) =>
            val formErrorFieldKey = activeMapping.formFieldKeyBy(idapiError.context getOrElse "")
            formWithErrors.withError(formErrorFieldKey, idapiError.description)
        }
    }
  }

  /**
    * Create a copy of ProfileForms with applied change to the currently active form
    *
    * @param changeFunc function that takes currently active form and returns a modified version of the form
    * @return copy of ProfileForms with applied change to the currently active form
    */
  private def transform(changeFunc: (Form[_ <: UserFormData]) => Form[_ <: UserFormData]): ProfileForms = {
    activePage match {
      case PublicEditProfilePage => copy(publicForm = changeFunc(publicForm).asInstanceOf[Form[ProfileFormData]])
      case AccountEditProfilePage => copy(accountForm = changeFunc(accountForm).asInstanceOf[Form[AccountFormData]])
      case EmailPrefsProfilePage => copy(privacyForm = changeFunc(privacyForm).asInstanceOf[Form[PrivacyFormData]])
      case page => throw new RuntimeException(s"Unexpected page $page")
    }
  }
}

object ProfileForms {
  /**
    * Constructs ProfileForms instance by filling all the Edit Profile forms (Public, Account, Privacy)
    * with the corresponding DTO that will be constructed out of the provided User DO
    *
    * @param userDO User domain object from IDAPI used to create per-form specialised DTO fillers
    * @param activePage Which page is user currently viewing
    * @param profileFormsMapping Case class with mappings for all the forms
    * @return instance of ProfileForms having all the forms bound to their respective specialised DTO
    */
  def apply(
      userDO: User,
      activePage: IdentityPage)
      (implicit profileFormsMapping: ProfileFormsMapping, messagesProvider: MessagesProvider): ProfileForms = {

    ProfileForms(
      publicForm = profileFormsMapping.profileMapping.fillForm(userDO),
      accountForm = profileFormsMapping.accountDetailsMapping.fillForm(userDO),
      privacyForm = profileFormsMapping.privacyMapping.fillForm(userDO),
      activePage = activePage
    )

  }

}
