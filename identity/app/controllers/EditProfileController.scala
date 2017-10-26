package controllers

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.User
import common.ImplicitControllerExecutionContext
import controllers.EmailPrefsData.emailPrefsForm
import form._
import idapiclient.responses.Error
import idapiclient.IdApiClient
import model._
import play.api.data.Form
import play.api.i18n.{I18nSupport, MessagesProvider}
import play.api.mvc._
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services._
import utils.SafeLogging

import scala.concurrent.Future

object PublicEditProfilePage extends IdentityPage("/public/edit", "Edit Public Profile")
object AccountEditProfilePage extends IdentityPage("/account/edit", "Edit Account Details")
object PrivacyEditProfilePage extends IdentityPage("/privacy/edit", "Privacy")
object MembershipEditProfilePage extends IdentityPage("/membership/edit", "Membership")
object recurringContributionPage extends IdentityPage("/contribution/recurring/edit", "Contributions")
object DigiPackEditProfilePage extends IdentityPage("/digitalpack/edit", "Digital Pack")

class EditProfileController(
    idUrlBuilder: IdentityUrlBuilder,
    authenticatedActions: AuthenticatedActions,
    identityApiClient: IdApiClient,
    idRequestParser: IdRequestParser,
    csrfCheck: CSRFCheck,
    csrfAddToken: CSRFAddToken,
    implicit val profileFormsMapping: ProfileFormsMapping,
    val controllerComponents: ControllerComponents)
    (implicit context: ApplicationContext)
  extends BaseController
  with ImplicitControllerExecutionContext
  with SafeLogging
  with I18nSupport {

  import authenticatedActions._

  def displayPublicProfileForm: Action[AnyContent] = displayForm(PublicEditProfilePage)
  def displayAccountForm: Action[AnyContent] = displayForm(AccountEditProfilePage)
  def displayMembershipForm: Action[AnyContent] = displayForm(MembershipEditProfilePage)
  def displayRecurringContributionForm: Action[AnyContent] = displayForm(recurringContributionPage)
  def displayDigitalPackForm: Action[AnyContent] = displayForm(DigiPackEditProfilePage)
  def displayPrivacyForm: Action[AnyContent] = displayForm(PrivacyEditProfilePage)

  def submitPublicProfileForm(): Action[AnyContent] = submitForm(PublicEditProfilePage)
  def submitAccountForm(): Action[AnyContent] = submitForm(AccountEditProfilePage)
  def submitPrivacyForm(): Action[AnyContent] = submitForm(PrivacyEditProfilePage)

  def getEmailPrefsForm(request: AuthRequest[AnyContent]): Future[Form[EmailPrefsData]] = {
    import EmailPrefsData._

    val idRequest = idRequestParser(request)
    val userId = request.user.getId()
    val subscriberFuture = identityApiClient.userEmails(userId, idRequest.trackingData)

    for {
      subscriber <- subscriberFuture
    } yield {
      subscriber match {
        case Right(s) => {
          val form = emailPrefsForm.fill(EmailPrefsData(
            s.htmlPreference,
            s.subscriptions.map(_.listId)
          ))
          form
        }
        case s => {
          val errors = s.left.getOrElse(Nil)
          val formWithErrors = errors.foldLeft(emailPrefsForm) {
            case (formWithErrors, Error(message, description, _, context)) =>
              formWithErrors.withGlobalError(description)
          }
          formWithErrors
        }
      }
    }
  }

  private def displayForm(page: IdentityPage) = csrfAddToken {
    recentlyAuthenticated.async { implicit request =>

      val idRequest = idRequestParser(request)
      val forms = getEmailPrefsForm(request)

      forms.map(form => {
        Future {
          profileFormsView(
            page = page,
            forms = ProfileForms(request.user, PublicEditProfilePage),
            request.user,
            form,
            getEmailSubscriptions(form).toList,
            EmailNewsletters.all,
            idRequest,
            idUrlBuilder
          )
        }
      }).flatMap(identity)
    }
  }

  protected def getEmailSubscriptions(form: Form[EmailPrefsData], add: List[String] = List(), remove: List[String] = List()) =
    form.data.filter(_._1.startsWith("currentEmailSubscriptions")).map(_._2).filterNot(remove.toSet) ++ add

  private def submitForm(page: IdentityPage): Action[AnyContent] =
    csrfCheck {
      authActionWithUser.async { implicit request =>
        val userDO = request.user
        val boundProfileForms =
          ProfileForms(userDO, activePage = page).bindFromRequestWithAddressErrorHack(request) // NOTE: only active form is bound to request data

        val idRequest = idRequestParser(request)
        val forms = getEmailPrefsForm(request)

        def processSuccessfulSubmission(userFormData: UserFormData): Future[Result] = {
          forms.map(form => {
            userFormData match {
              case formData: AccountFormData if (formData.deleteTelephone) => {
                identityApiClient.deleteTelephone(userDO.auth) map {
                  case Left(errors) => profileFormsView(page, boundProfileForms.withErrors(errors), userDO, emailPrefsForm,getEmailSubscriptions(form).toList,EmailNewsletters.all,idRequest,idUrlBuilder)

                  case Right(_) => {
                    val boundForms =
                      boundProfileForms.bindForms(
                        userDO.user.copy(privateFields = userDO.user.privateFields.copy(telephoneNumber = None)))

                    profileFormsView(page, boundForms, userDO, emailPrefsForm,getEmailSubscriptions(form).toList,EmailNewsletters.all,idRequest,idUrlBuilder)
                  }
                }
              }

              case formData: UserFormData =>
                identityApiClient.saveUser(userDO.id, formData.toUserUpdate(userDO), userDO.auth) map {
                  case Left(errors) => profileFormsView(page, boundProfileForms.withErrors(errors), userDO, emailPrefsForm,getEmailSubscriptions(form).toList,EmailNewsletters.all,idRequest,idUrlBuilder)
                  case Right(updatedUser) => profileFormsView(page, boundProfileForms.bindForms(updatedUser), updatedUser, emailPrefsForm,getEmailSubscriptions(form).toList,EmailNewsletters.all,idRequest,idUrlBuilder)
                }
            }
          }).flatMap(identity)
        }

        forms.map(form => {
          boundProfileForms.activeForm.fold(
            formWithErrors => Future(profileFormsView(page, boundProfileForms, userDO, emailPrefsForm,getEmailSubscriptions(form).toList,EmailNewsletters.all,idRequest,idUrlBuilder)),
            userFormData => processSuccessfulSubmission(userFormData)
          )
        }).flatMap(identity)
      }

    } // end authActionWithUser.async

  private def profileFormsView(
                                page: IdentityPage,
                                forms: ProfileForms,
                                user: User,
                                emailPrefsForm: Form[EmailPrefsData],
                                emailSubscriptions: List[String],
                                availableLists: EmailNewsletters,
                                idRequest: services.IdentityRequest,
                                identityUrlBuilder: IdentityUrlBuilder
                              )
      (implicit request: AuthRequest[AnyContent]): Result =
    NoCache(Ok(views.html.profileForms(page, user, forms, idRequestParser(request), idUrlBuilder,emailPrefsForm,availableLists,emailSubscriptions)))
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
    case PrivacyEditProfilePage => privacyForm
  }

  private lazy val activeMapping = activePage match {
    case PublicEditProfilePage => profileFormsMapping.profileMapping
    case AccountEditProfilePage => profileFormsMapping.accountDetailsMapping
    case PrivacyEditProfilePage => profileFormsMapping.privacyMapping
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
  def bindFromRequestWithAddressErrorHack(implicit request: Request[_]): ProfileForms = update {
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
    update{
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
  private def update(changeFunc: (Form[_ <: UserFormData]) => Form[_ <: UserFormData]): ProfileForms = {
    activePage match {
      case PublicEditProfilePage => copy(publicForm = changeFunc(publicForm).asInstanceOf[Form[ProfileFormData]])
      case AccountEditProfilePage => copy(accountForm = changeFunc(accountForm).asInstanceOf[Form[AccountFormData]])
      case PrivacyEditProfilePage => copy(privacyForm = changeFunc(privacyForm).asInstanceOf[Form[PrivacyFormData]])
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
