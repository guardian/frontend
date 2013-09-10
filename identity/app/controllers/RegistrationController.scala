package controllers

import com.google.inject.Inject
import services.{UserCreationService, IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import idapiclient.IdApiClient
import play.api.mvc._
import common.ExecutionContexts
import utils.SafeLogging
import javax.inject.Singleton
import model.IdentityPage
import play.api.data._
import form.Mappings._
import play.api.data.validation.Constraints
import views.html.helper.form
import client.Error

@Singleton
class RegistrationController @Inject()( returnUrlVerifier : ReturnUrlVerifier,
                                     userCreationService : UserCreationService,
                                     api: IdApiClient,
                                     idRequestParser : IdRequestParser,
                                     idUrlBuilder : IdentityUrlBuilder ) extends Controller with ExecutionContexts with SafeLogging  {


  val page = new IdentityPage("/register", "Register", "register")

  val registrationForm = Form(
      Forms.tuple(
        "user.primaryEmailAddress" -> Forms.text
          .verifying(Constraints.nonEmpty),
        "user.publicFields.username" -> Forms.text
          .verifying(Constraints.nonEmpty),
        "user.password" -> Forms.text
          .verifying(Constraints.nonEmpty),
        "receive_gnm_marketing" -> Forms.boolean,
        "receive_third_party_marketing" -> Forms.boolean
      )
  )

  def renderForm = Action { implicit request =>
    logger.trace("Rendering registration form")
    val idRequest = idRequestParser(request)
    val filledForm = registrationForm.fill("","","",false,false)
    Ok(views.html.registration(page, idRequest, idUrlBuilder, filledForm ))
  }

  def processForm = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = registrationForm.bindFromRequest
    boundForm.fold(
      formWithErrors => {
        logger.info("Invalid registration request")
        Ok(views.html.registration(page, idRequest, idUrlBuilder, formWithErrors ))
      },
    {
      case(email, username, password, gnmMarketing, thirdPartyMarketing) => {
        val user = userCreationService.createUser(email, username, password, gnmMarketing, thirdPartyMarketing)
        Async {
          api.register(user, idRequest.omnitureData) map ( _ match {
             case Left(errors) => {
               val formWithError = errors.foldLeft(boundForm) {  (form, error) =>
                 error match {
                   case Error(_, description, _, context) =>
                     form.withError(context.getOrElse(""), description)
                 }
               }
               formWithError.fill(email,username,"",thirdPartyMarketing,gnmMarketing)
               Ok(views.html.registration(page, idRequest, idUrlBuilder, formWithError))
             }
             case Right(user) => {
               val verifiedReturnUrl = returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl)
               Ok(views.html.registration_confirmation(page, idRequest, idUrlBuilder, verifiedReturnUrl))
             }
          })
        }
      }
    })
  }
}
