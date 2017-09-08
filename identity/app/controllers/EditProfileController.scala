package controllers

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.User
import common.ExecutionContexts
import form._
import idapiclient.IdApiClient
import model._
import play.api.data.Form
import play.api.i18n.{I18nSupport, MessagesApi}
import play.api.mvc.{AnyContent, Controller, Request}
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
                            val messagesApi: MessagesApi,
                            csrfCheck: CSRFCheck,
                            csrfAddToken: CSRFAddToken,
                            implicit val profileFormsMapping: ProfileFormsMapping)
                           (implicit context: ApplicationContext)
  extends Controller with ExecutionContexts with SafeLogging with I18nSupport {

  import authenticatedActions._

  private val accountPage = IdentityPage("/account/edit", "Edit Account Details")
  private val publicPage = IdentityPage("/public/edit", "Edit Public Profile")
  private val membershipPage = IdentityPage("/membership/edit", "Membership")
  private val digitalPackPage = IdentityPage("/digitalpack/edit", "Digital Pack")
  private val privacyPage = IdentityPage("/privacy/edit", "Privacy")

  def displayPublicProfileForm = displayForm(publicPage)
  def displayAccountForm = displayForm(accountPage)
  def displayMembershipForm = displayForm(membershipPage)
  def displayDigitalPackForm = displayForm(digitalPackPage)
  def displayPrivacyForm = displayForm(privacyPage)

  private def displayForm(page: IdentityPage) = csrfAddToken {
    recentlyAuthenticated.async { implicit request =>
      Future(profileFormsView(page = page, forms = ProfileForms(request.user, PublicEditProfilePage), request.user))
    }
  }

  def submitPublicProfileForm() = submitForm(publicPage)
  def submitAccountForm() = submitForm(accountPage)
  def submitPrivacyForm() = submitForm(privacyPage)

  def identifyActiveSubmittedForm(page: IdentityPage): EditProfilePage =
    page match {
      case `publicPage` => PublicEditProfilePage
      case `accountPage` => AccountEditProfilePage
      case _ => PrivacyEditProfilePage
    }

  def submitForm(page: IdentityPage) = csrfCheck { authActionWithUser.async { implicit request =>
      val activePage = identifyActiveSubmittedForm(page)
      val user = request.user
      val forms = ProfileForms(user, activePage).bindFromRequest(request)

      forms.activeForm.value.map {
        case data: AccountFormData if (data.deleteTelephone) => {
          identityApiClient.deleteTelephone(user.auth) map {
            case Left(errors) => profileFormsView(page, forms.withErrors(errors), user)

            case Right(_) => {
              val boundForms = forms.bindForms(user.user.copy(privateFields = user.user.privateFields.copy(telephoneNumber = None)))
              profileFormsView(page, boundForms, user)
            }
          }
        }

        case data: UserFormData =>
          identityApiClient.saveUser(user.id, data.toUserUpdate(user), user.auth) map {
            case Left(errors) => profileFormsView(page, forms.withErrors(errors), user)
            case Right(updatedUser) => profileFormsView(page, forms.bindForms(updatedUser), updatedUser)
          }
      }.getOrElse(Future(profileFormsView(page, forms, user)))
    }
  }

  private def profileFormsView(page: IdentityPage, forms: ProfileForms, user: User)(implicit request: AuthRequest[AnyContent]) =
    NoCache(Ok(views.html.profileForms(page, user, forms, idRequestParser(request), idUrlBuilder)))
}

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

  def bindFromRequest(implicit request: Request[_]) = update {
    form =>
      // Hack to get the postcode error into the correct context.
      val boundForm = form.bindFromRequest()
      boundForm.error("address") map {
        e =>
          boundForm.withError(e.copy(key = "address.postcode"))
      } getOrElse boundForm
  }

  def bindForms(user: User): ProfileForms = {
    copy(
      publicForm = profileFormsMapping.profileMapping.bindForm(user),
      accountForm = profileFormsMapping.accountDetailsMapping.bindForm(user),
      privacyForm = profileFormsMapping.privacyMapping.bindForm(user)
    )
  }

  def withErrors(errors: List[client.Error]): ProfileForms = {
    update{
      form =>
        errors.foldLeft(form){
          (formWithErrors, error) =>
            val context = activeMapping.mapContext(error.context getOrElse "")
            formWithErrors.withError(context, error.description)
        }
    }
  }

  private lazy val activeMapping = activePage match {
    case PublicEditProfilePage => profileFormsMapping.profileMapping
    case AccountEditProfilePage => profileFormsMapping.accountDetailsMapping
    case PrivacyEditProfilePage => profileFormsMapping.privacyMapping
  }

  private def update(change: (Form[_ <: UserFormData]) => Form[_ <: UserFormData]): ProfileForms = {
    activePage match {
      case PublicEditProfilePage => copy(publicForm = change(publicForm).asInstanceOf[Form[ProfileFormData]])
      case AccountEditProfilePage => copy(accountForm = change(accountForm).asInstanceOf[Form[AccountFormData]])
      case PrivacyEditProfilePage => copy(privacyForm = change(privacyForm).asInstanceOf[Form[PrivacyFormData]])
    }
  }
}

object ProfileForms {

  def apply(user: User, activePage: EditProfilePage)(implicit profileFormsMapping: ProfileFormsMapping): ProfileForms = ProfileForms(
    publicForm = profileFormsMapping.profileMapping.bindForm(user),
    accountForm = profileFormsMapping.accountDetailsMapping.bindForm(user),
    privacyForm = profileFormsMapping.privacyMapping.bindForm(user),
    activePage = activePage
  )
}
