package controllers

import play.api.mvc._
import common.ExecutionContexts
import services.{IdRequestParser, IdentityUrlBuilder}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging
import model.{NoCache, Cached, IdentityPage}
import play.api.data.{Forms, Form}
import idapiclient.{IdApiClient, UserUpdate}
import com.gu.identity.model.{PrivateFields, PublicFields, User}
import actions.AuthActionWithUser
import play.filters.csrf.{CSRFCheck, CSRFAddToken}
import form._
import scala.concurrent.Future
import com.gu.identity.model.User

@Singleton
class PublicProfileController @Inject()(idUrlBuilder: IdentityUrlBuilder,
                                        authActionWithUser: AuthActionWithUser,
                                        identityApiClient: IdApiClient,
                                        idRequestParser: IdRequestParser)
  extends Controller
  with ExecutionContexts
  with SafeLogging{

  val page = IdentityPage("/profile/public", "Public profile", "public profile")

  def displayPublicProfileForm = displayForm(isPublicFormActive = true)
  def displayAccountForm = displayForm(isPublicFormActive = false)

  protected def displayForm(isPublicFormActive: Boolean) = CSRFAddToken {
    authActionWithUser.apply { implicit request =>
      val idRequest = idRequestParser(request)
      val forms = ProfileForms(request.user, isPublicFormActive)
      NoCache(Ok(views.html.profileForms(page.tracking(idRequest), request.user, forms, idRequest, idUrlBuilder)))
    }
  }

  def submitPublicProfileForm() = submitForm(isProfileForm = true)
  def submitAccountForm() = submitForm(isProfileForm = false)

  def submitForm(isProfileForm: Boolean) = CSRFCheck {
    authActionWithUser.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        val forms = ProfileForms(request.user, isProfileForm).bindFromRequest(request)
        val futureFormOpt = forms.activeForm.value map {
          data: UserFormData =>
            identityApiClient.saveUser(request.user.id, data.toUserUpdate(request.user), request.auth) map {
              case Left(errors) =>
                forms.withErrors(errors)

              case Right(user) => forms.bindForms(user)
            }
        }

        val futureForms = futureFormOpt getOrElse Future.successful(forms)
        futureForms map {
          forms =>
            NoCache(Ok(views.html.profileForms(page.accountEdited(idRequest), request.user, forms, idRequest,idUrlBuilder)))
        }
    }
  }

  def publicProfilePage(vanityUrl: String) = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    identityApiClient.userFromVanityUrl(userName = vanityUrl).map {
      case Left(errors) => {
        NotFound(views.html.errors._404())
      }
      case Right(user) => {
        Cached(60)(Ok(views.html.public_profile_page(page, idRequest, idUrlBuilder, user)))
      }
    }
  }
}

case class ProfileForms(publicForm: Form[ProfileFormData], accountForm: Form[AccountFormData], isPublicFormActive: Boolean)
  extends ProfileMapping
  with AccountDetailsMapping {

  lazy val activeForm = if(isPublicFormActive) publicForm else accountForm

  def bindFromRequest(implicit request: Request[_]) = update {
    form =>
      form.bindFromRequest()
  }

  def bindForms(user: User): ProfileForms = {
    copy(
      publicForm = profileMapping.bindForm(user),
      accountForm = accountDetailsMapping.bindForm(user)
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

  private lazy val activeMapping = if(isPublicFormActive) profileMapping else accountDetailsMapping

  private def update(change: (Form[_ <: UserFormData]) => Form[_ <: UserFormData]): ProfileForms = {
    if(isPublicFormActive){
      copy(publicForm = change(publicForm).asInstanceOf[Form[ProfileFormData]])
    }
    else
      copy(accountForm = change(accountForm).asInstanceOf[Form[AccountFormData]])
  }
}

object ProfileForms
  extends ProfileMapping
  with AccountDetailsMapping {

    def apply(user: User, isPublicFormActive: Boolean): ProfileForms = ProfileForms(
      publicForm = profileMapping.bindForm(user),
      accountForm = accountDetailsMapping.bindForm(user),
      isPublicFormActive = isPublicFormActive
    )
  }
