package controllers

import com.google.inject.{Singleton, Inject}
import services._
import actions.AuthActionWithUser
import idapiclient.IdApiClient
import play.api.mvc.{AnyContent, Request, Controller}
import common.ExecutionContexts
import utils.SafeLogging
import model.{AvatarData, NoCache, IdentityPage}
import play.filters.csrf.{CSRFCheck, CSRFAddToken}
import form._
import scala.concurrent.Future
import play.api.data.Form
import com.gu.identity.model.User
import tracking.{TrackingParams, Omniture}
import conf.Switches._
import play.api.libs.ws.WS
import actions.AuthRequest
import services.IdentityRequest
import model.AvatarUploadData
import conf.Configuration

@Singleton
class EditProfileController @Inject()(idUrlBuilder: IdentityUrlBuilder,
                                      authActionWithUser: AuthActionWithUser,
                                      identityApiClient: IdApiClient,
                                      idRequestParser: IdRequestParser)
  extends Controller
  with ExecutionContexts
  with SafeLogging{

  type OmniPage = IdentityPage with Omniture

  protected val accountPage =IdentityPage("/account/edit", "Edit Account Details", "edit account details")
  protected val publicPage =IdentityPage("/public/edit", "Edit Public Profile", "edit public profile")

  lazy val AvatarSigningService = new AvatarSigningService(Configuration.avatars.signingKey)

  def displayPublicProfileForm = displayForm(publicPage, isPublicFormActive = true)
  def displayAccountForm = displayForm(accountPage, isPublicFormActive = false)

  protected def displayForm(page: OmniPage, isPublicFormActive: Boolean) = CSRFAddToken {
    authActionWithUser.async { implicit request =>
      profileFormsView(page.tracking, ProfileForms(request.user, isPublicFormActive))
    }
  }

  def submitPublicProfileForm() = submitForm(publicPage, isProfileForm = true)
  def submitAccountForm() = submitForm(accountPage, isProfileForm = false)

  def submitForm(page: OmniPage, isProfileForm: Boolean) = CSRFCheck {
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
        futureForms flatMap {
          forms =>
            profileFormsView(page.accountEdited, forms)
        }
    }
  }

  def profileFormsView(pageWithTrackingParamsFor: IdentityRequest => IdentityPage with TrackingParams, forms: ProfileForms)(implicit request: AuthRequest[AnyContent]) = {
    val idRequest = idRequestParser(request)
    val user = request.user

    for { avatarUploadData <- Future.sequence(IdentityAvatarUploadSwitch.opt(avatarUploadDataFor(user)).toSeq) } yield {
      NoCache(Ok(views.html.profileForms(pageWithTrackingParamsFor(idRequest), user, forms, idRequest, idUrlBuilder, avatarUploadData.headOption)))
    }
  }

  private def avatarUploadDataFor(user: User) = for { uploadToken <- WS.url("https://gu-image-upload.appspot.com/upload-endpoint-generator").get.map(_.body) } yield {
    AvatarUploadData(uploadToken, AvatarSigningService.sign(AvatarData(user)))
  }
}

case class ProfileForms(publicForm: Form[ProfileFormData], accountForm: Form[AccountFormData], isPublicFormActive: Boolean)
  extends ProfileMapping
  with AccountDetailsMapping {

  lazy val activeForm = if(isPublicFormActive) publicForm else accountForm

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
