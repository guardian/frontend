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
import form.{AccountFormData, ProfileFormData, AccountDetailsMapping, ProfileMapping}
import scala.concurrent.Future

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
      val boundProfileForm = profileMapping.bindForm(request.user)
      val boundAccountDetailsForm = accountDetailsMapping.bindForm(request.user)
      Ok(views.html.public_profile(page.tracking(idRequest), request.user, boundProfileForm, boundAccountDetailsForm, idRequest, idUrlBuilder))
    }
  }

  def submitProfileForm = CSRFCheck {
    authActionWithUser.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        val boundForm = profileMapping.bindFromRequest()
        val futureFormOpt = boundForm.value map {
          data =>
            identityApiClient.saveUser(request.user.id, data.toUserUpdate, request.auth) map {
              case Left(errors) =>
                errors.foldLeft(boundForm) {
                  (formWithErrors, error) =>
                    formWithErrors.withError(profileMapping.mapContext(error.context getOrElse ""), error.description)
                }

              case Right(user) => profileMapping.bindForm(user)
            }
        }

        val futureForm = futureFormOpt getOrElse Future.successful(boundForm)
        futureForm map {
          form: Form[ProfileFormData] =>
            Ok(views.html.public_profile(page.accountEdited(idRequest), request.user, form, accountDetailsMapping.form, idRequest, idUrlBuilder))
        }
    }
  }

  protected def submitForm(profileFormData: Form[ProfileFormData], accountFormData: Form[AccountFormData], isAccountForm: Boolean) ={
    val updateOpt = if(isAccountForm) accountFormData.value map {_.toUser}
      else profileFormData.value map {_.toUserUpdate}
    updateOpt
  }
}
