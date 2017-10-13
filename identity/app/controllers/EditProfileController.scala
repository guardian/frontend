package controllers

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.User
import common.ImplicitControllerExecutionContext
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

sealed trait EditProfilePage
case object PublicEditProfilePage extends EditProfilePage
case object AccountEditProfilePage extends EditProfilePage
case object PrivacyEditProfilePage extends EditProfilePage

class EditProfileController(idUrlBuilder: IdentityUrlBuilder,
  authenticatedActions: AuthenticatedActions,
  identityApiClient: IdApiClient,
  idRequestParser: IdRequestParser,
  csrfCheck: CSRFCheck,
  csrfAddToken: CSRFAddToken,
  implicit val profileFormsMapping: ProfileFormsMapping,
  val controllerComponents: ControllerComponents)
  (implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with SafeLogging with I18nSupport {

  import authenticatedActions._

  private val accountPage = IdentityPage("/account/edit", "Edit Account Details")
  private val publicPage = IdentityPage("/public/edit", "Edit Public Profile")
  private val membershipPage = IdentityPage("/membership/edit", "Membership")
  private val digitalPackPage = IdentityPage("/digitalpack/edit", "Digital Pack")
  private val privacyPage = IdentityPage("/privacy/edit", "Privacy")

  def displayPublicProfileForm: Action[AnyContent] = displayForm(publicPage)
  def displayAccountForm: Action[AnyContent] = displayForm(accountPage)
  def displayMembershipForm: Action[AnyContent] = displayForm(membershipPage)
  def displayDigitalPackForm: Action[AnyContent] = displayForm(digitalPackPage)
  def displayPrivacyForm: Action[AnyContent] = displayForm(privacyPage)

  def submitPublicProfileForm(): Action[AnyContent] = submitForm(publicPage)
  def submitAccountForm(): Action[AnyContent] = submitForm(accountPage)
  def submitPrivacyForm(): Action[AnyContent] = submitForm(privacyPage)

  private def displayForm(page: IdentityPage) = csrfAddToken {
    recentlyAuthenticated.async { implicit request =>
      Future(profileFormsView(page = page, forms = ProfileForms(request.user, PublicEditProfilePage), request.user))
    }
  }

  private def submitForm(page: IdentityPage): Action[AnyContent] = csrfCheck { authActionWithUser.async { implicit request =>
    def identityPageToEditProfilePage(identityPage: IdentityPage): EditProfilePage =
      identityPage match {
        case `publicPage` => PublicEditProfilePage
        case `accountPage` => AccountEditProfilePage
        case _ => PrivacyEditProfilePage
      }

      val activePage = identityPageToEditProfilePage(page)
      val userFromRequest = request.user
      val profileForms =
        ProfileForms(userFromRequest, activePage).bindFromRequestWithAddressErrorHack(request) // Why are we binding from case class and then re-binding from request?

//    def error(formWithErrors: Form[UserFormData]) =

      profileForms.activeForm.value.map {
        case data: AccountFormData if (data.deleteTelephone) => {
          identityApiClient.deleteTelephone(userFromRequest.auth) map {
            case Left(errors) => profileFormsView(page, profileForms.withErrors(errors), userFromRequest)

            case Right(_) => {
              val boundForms = profileForms.bindForms(userFromRequest.user.copy(privateFields = userFromRequest.user.privateFields.copy(telephoneNumber = None)))
              profileFormsView(page, boundForms, userFromRequest)
            }
          }
        }

        case data: UserFormData =>
          identityApiClient.saveUser(userFromRequest.id, data.toUserUpdate(userFromRequest), userFromRequest.auth) map {
            case Left(errors) => profileFormsView(page, profileForms.withErrors(errors), userFromRequest)
            case Right(updatedUser) => profileFormsView(page, profileForms.bindForms(updatedUser), updatedUser)
          }
      }.getOrElse(Future(profileFormsView(page, profileForms, userFromRequest)))
    }
  }

  private def profileFormsView(page: IdentityPage, forms: ProfileForms, user: User)(implicit request: AuthRequest[AnyContent]) =
    NoCache(Ok(views.html.profileForms(page, user, forms, idRequestParser(request), idUrlBuilder)))
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
    activePage: EditProfilePage)(implicit profileFormsMapping: ProfileFormsMapping) {

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
      publicForm = profileFormsMapping.profileMapping.bindForm(user),
      accountForm = profileFormsMapping.accountDetailsMapping.bindForm(user),
      privacyForm = profileFormsMapping.privacyMapping.bindForm(user)
    )
  }

  /** Adds address hack error to the form */
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
  def withErrors(errors: List[Error]): ProfileForms = {
    update{
      form =>
        errors.foldLeft(form){
          (formWithErrors, error) =>
            val context = activeMapping.mapContext(error.context getOrElse "")
            formWithErrors.withError(context, error.description)
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
    * Creates a instance of ProfileForms by filling all the Edit Profile forms (Public, Account, Privacy)
    * with the provided User value
    *
    * @param user User instance used as a form filler
    * @param activePage Which page is user currently viewing
    * @param profileFormsMapping Case class with mappings for all the forms
    * @return instance of ProfileForms having all the forms bound to provided user value
    */
  def apply(
      user: User,
      activePage: EditProfilePage)
      (implicit profileFormsMapping: ProfileFormsMapping, messagesProvider: MessagesProvider): ProfileForms = {

    ProfileForms(
      publicForm = profileFormsMapping.profileMapping.bindForm(user),
      accountForm = profileFormsMapping.accountDetailsMapping.bindForm(user),
      privacyForm = profileFormsMapping.privacyMapping.bindForm(user),
      activePage = activePage
    )

  }

}
