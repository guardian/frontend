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
  with SafeLogging
  with ProfileMapping
  with AccountDetailsMapping {

  val page = IdentityPage("/profile/public", "Public profile", "public profile")

  def displayForm = CSRFAddToken {
    authActionWithUser.apply { implicit request =>
      val idRequest = idRequestParser(request)
      val (boundProfileForm, boundAccountDetailsForm) = bindForms(request.user)
      Ok(views.html.public_profile(page.tracking(idRequest), request.user, boundProfileForm, boundAccountDetailsForm, idRequest, idUrlBuilder))
    }
  }

  def submitProfileForm() = submitForm(isProfileForm = true)
  def submitAccountForm() = submitForm(isProfileForm = false)

  def submitForm(isProfileForm: Boolean) = CSRFCheck {
    authActionWithUser.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        val boundForms = bindFromRequest(isProfileForm)
        val activeForm = if(isProfileForm) boundForms._1 else boundForms._2
        val futureFormOpt = activeForm.value map {
          data: UserFormData =>
            identityApiClient.saveUser(request.user.id, data.toUserUpdate, request.auth) map {
              case Left(errors) =>
                val errorForm = errors.foldLeft(activeForm) {
                  (formWithErrors, error) =>
                    formWithErrors.withError(profileMapping.mapContext(error.context getOrElse ""), error.description)
                }
                if(isProfileForm)
                  (errorForm.asInstanceOf[Form[ProfileFormData]], boundForms._2)
                else
                  (boundForms._1, errorForm.asInstanceOf[Form[AccountFormData]])

              case Right(user) => bindForms(user)
            }
        }

        val futureForms = futureFormOpt getOrElse Future.successful(boundForms)
        futureForms map {
          forms =>
            Ok(views.html.public_profile(page.accountEdited(idRequest), request.user, forms._1, forms._2, idRequest,idUrlBuilder))
        }
    }
  }

  protected def bindForms(user: User) = (profileMapping.bindForm(user), accountDetailsMapping.bindForm(user))

  protected def bindFromRequest(isProfileForm: Boolean)(implicit request: Request[_]) = {
    if(isProfileForm)
      (profileMapping.bindFromRequest(), accountDetailsMapping.form)
    else
      (profileMapping.form, accountDetailsMapping.bindFromRequest())
  }

  protected def submitForm(profileFormData: Form[ProfileFormData], accountFormData: Form[AccountFormData], isAccountForm: Boolean) ={
    val updateOpt = if(isAccountForm) accountFormData.value map {_.toUserUpdate}
      else profileFormData.value map {_.toUserUpdate}
    updateOpt
  }
}
