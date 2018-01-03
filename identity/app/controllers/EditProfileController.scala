package controllers

import actions.AuthenticatedActions
import com.gu.identity.model.User
import form._
import idapiclient.responses.Error
import idapiclient.IdApiClient
import model._
import play.api.data.Form
import play.api.i18n.MessagesProvider
import play.api.mvc._
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services.{IdRequestParser, IdentityUrlBuilder, ReturnUrlVerifier, _}
import play.api.http.HttpConfiguration

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
    override val idUrlBuilder: IdentityUrlBuilder,
    override val authenticatedActions: AuthenticatedActions,
    override val identityApiClient: IdApiClient,
    override val idRequestParser: IdRequestParser,
    override val csrfCheck: CSRFCheck,
    override val csrfAddToken: CSRFAddToken,
    override val returnUrlVerifier: ReturnUrlVerifier,
    override implicit val profileFormsMapping: ProfileFormsMapping,
    val controllerComponents: ControllerComponents,
    override val newsletterService: NewsletterService,
    val httpConfiguration: HttpConfiguration,
    override implicit val context: ApplicationContext)
  extends EditProfileControllerComponents
  with EditProfileFormHandling
  with ConsentsController {

  import authenticatedActions._

  /** GET /public/edit */
  def displayPublicProfileForm: Action[AnyContent] = displayForm(PublicEditProfilePage)

  /** GET /account/edit */
  def displayAccountForm: Action[AnyContent] = displayForm(AccountEditProfilePage)

  /** GET /membership/edit */
  def displayMembershipForm: Action[AnyContent] = displayForm(MembershipEditProfilePage)

  /** GET /contribution/recurring/edit */
  def displayRecurringContributionForm: Action[AnyContent] = displayForm(recurringContributionPage)

  /** GET /digitalpack/edit */
  def displayDigitalPackForm: Action[AnyContent] = displayForm(DigiPackEditProfilePage)


  /** POST /public/edit */
  def submitPublicProfileForm(): Action[AnyContent] = submitForm(PublicEditProfilePage)

  /** POST /account/edit */
  def submitAccountForm(): Action[AnyContent] = submitForm(AccountEditProfilePage)

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
