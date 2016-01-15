package controllers

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import com.google.inject.{Inject, Singleton}
import com.gu.identity.model.User
import common.ExecutionContexts
import form._
import idapiclient.IdApiClient
import model._
import play.api.data.Form
import play.api.i18n.{ MessagesApi, I18nSupport }
import play.api.mvc.{AnyContent, Controller, Request}
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services._
import tracking.Omniture
import utils.SafeLogging

import scala.concurrent.Future

sealed trait EditProfilePage
case object PublicEditProfilePage extends EditProfilePage
case object AccountEditProfilePage extends EditProfilePage
case object PrivacyEditProfilePage extends EditProfilePage

@Singleton
class EditProfileController @Inject()(idUrlBuilder: IdentityUrlBuilder,
                                      authenticatedActions: AuthenticatedActions,
                                      identityApiClient: IdApiClient,
                                      idRequestParser: IdRequestParser,
                                      val messagesApi: MessagesApi)
  extends Controller with ExecutionContexts with SafeLogging with I18nSupport {

  import authenticatedActions._

  protected val accountPage = IdentityPage("/account/edit", "Edit Account Details", "edit account details")
  protected val publicPage = IdentityPage("/public/edit", "Edit Public Profile", "edit public profile")
  protected val membershipPage = IdentityPage("/membership/edit", "Membership", "edit membership details")
  protected val digitalPackPage = IdentityPage("/digitalpack/edit", "Digital Pack", "edit digital pack details")
  protected val privacyPage = IdentityPage("/privacy/edit", "Privacy", "edit privacy details")

  def displayPublicProfileForm = displayForm(publicPage)
  def displayAccountForm = displayForm(accountPage)
  def displayMembershipForm = displayForm(membershipPage)
  def displayDigitalPackForm = displayForm(digitalPackPage)
  def displayPrivacyForm = displayForm(privacyPage)

  protected def displayForm(page: IdentityPage) = CSRFAddToken {
    recentlyAuthenticated.async { implicit request =>
      profileFormsView(Omniture.tracking(page,idRequestParser(request)), ProfileForms(request.user, PublicEditProfilePage))
    }
  }

  def submitPublicProfileForm() = submitForm(publicPage)
  def submitAccountForm() = submitForm(accountPage)
  def submitPrivacyForm() = submitForm(privacyPage)

  def identifyActiveSubmittedForm(page: IdentityPage): EditProfilePage =
    if(page == publicPage)
      PublicEditProfilePage
    else if(page == accountPage)
      AccountEditProfilePage
    else
      PrivacyEditProfilePage

  def submitForm(page: IdentityPage) = CSRFCheck {
    authActionWithUser.async {
      implicit request =>
        val activePage = identifyActiveSubmittedForm(page)
        val idRequest = idRequestParser(request)
        val user = request.user
        val forms = ProfileForms(user, activePage).bindFromRequest(request)
        val futureFormOpt = forms.activeForm.value map {
          data: UserFormData =>
            identityApiClient.saveUser(user.id, data.toUserUpdate(user), user.auth) map {
              case Left(errors) =>
                forms.withErrors(errors)

              case Right(user) => forms.bindForms(user)
            }
        }

        val futureForms = futureFormOpt getOrElse Future.successful(forms)
        futureForms flatMap {
          forms =>
            profileFormsView(Omniture.accountEdited(page, idRequest), forms)
        }
    }
  }

  def profileFormsView(pageWithTrackingParams: IdentityPage, forms: ProfileForms)(implicit request: AuthRequest[AnyContent]) = {
    val idRequest = idRequestParser(request)
    val user = request.user

    Future(NoCache(Ok(views.html.profileForms(
           pageWithTrackingParams,
           user, forms, idRequest, idUrlBuilder))))
  }
}

case class ProfileForms(publicForm: Form[ProfileFormData], accountForm: Form[AccountFormData], privacyForm: Form[PrivacyFormData], activePage: EditProfilePage)
  extends ProfileMapping
  with AccountDetailsMapping
  with PrivacyMapping
{

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
      publicForm = profileMapping.bindForm(user),
      accountForm = accountDetailsMapping.bindForm(user),
      privacyForm = privacyMapping.bindForm(user)
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
    case PublicEditProfilePage => profileMapping
    case AccountEditProfilePage => accountDetailsMapping
    case PrivacyEditProfilePage => privacyMapping
  }

  private def update(change: (Form[_ <: UserFormData]) => Form[_ <: UserFormData]): ProfileForms = {
    activePage match {
      case PublicEditProfilePage => copy(publicForm = change(publicForm).asInstanceOf[Form[ProfileFormData]])
      case AccountEditProfilePage => copy(accountForm = change(accountForm).asInstanceOf[Form[AccountFormData]])
      case PrivacyEditProfilePage => copy(privacyForm = change(privacyForm).asInstanceOf[Form[PrivacyFormData]])
    }
  }
}

object ProfileForms
  extends ProfileMapping
  with AccountDetailsMapping
  with PrivacyMapping {

  def apply(user: User, activePage: EditProfilePage): ProfileForms = ProfileForms(
    publicForm = profileMapping.bindForm(user),
    accountForm = accountDetailsMapping.bindForm(user),
    privacyForm = privacyMapping.bindForm(user),
    activePage = activePage
  )
}
