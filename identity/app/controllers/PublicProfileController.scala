package controllers

import play.api.mvc._
import common.ExecutionContexts
import services.{IdRequestParser, IdentityUrlBuilder}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging
import model.IdentityPage
import play.api.data.Form
import idapiclient.IdApiClient
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
      Ok(views.html.public_profile(page.tracking(idRequest), request.user, forms, idRequest, idUrlBuilder))
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
                println("Form Erros:" + errors)
                forms.withErrors(errors)

              case Right(user) => forms.bindForms(user)
            }
        }

        val futureForms = futureFormOpt getOrElse Future.successful(forms)
        futureForms map {
          forms =>
            Ok(views.html.public_profile(page.accountEdited(idRequest), request.user, forms, idRequest,idUrlBuilder))
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