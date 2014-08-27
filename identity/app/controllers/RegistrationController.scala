package controllers

import client._
import common.ExecutionContexts
import com.google.inject.Inject
import com.gu.identity.model.User
import idapiclient.{ IdApiClient, EmailPassword }
import javax.inject.Singleton
import model.{NoCache, IdentityPage}
import play.api.mvc._
import play.api.data._
import play.api.mvc.Result
import scala.concurrent.Future
import services._
import utils.SafeLogging
import form.Mappings

@Singleton
class RegistrationController @Inject()( returnUrlVerifier : ReturnUrlVerifier,
                                     userCreationService : UserCreationService,
                                     api: IdApiClient,
                                     idRequestParser : IdRequestParser,
                                     idUrlBuilder : IdentityUrlBuilder,
                                     signinService : PlaySigninService  )
  extends Controller with ExecutionContexts with SafeLogging with Mappings with implicits.Forms {

  val page = IdentityPage("/register", "Register", "register")

  private val registrationKey = "register"
  private val passwordKey = "user.password"

  val registrationForm = Form(
    Forms.tuple(
      "user.primaryEmailAddress" -> idEmail,
      "user.publicFields.username" -> Forms.text,
      passwordKey -> idPassword,
      "receive_gnm_marketing" -> Forms.boolean,
      "receive_third_party_marketing" -> Forms.boolean
    )
  )

  def renderForm = Action { implicit request =>
    logger.trace("Rendering registration form")

    val idRequest = idRequestParser(request)
    val filledForm = registrationForm.bindFromFlash(registrationKey).getOrElse(registrationForm.fill("","","",true,false))

    NoCache(Ok(views.html.registration(page.registrationStart(idRequest), idRequest, idUrlBuilder, filledForm)))
  }

  def processForm = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = registrationForm.bindFromRequest
    val trackingData = idRequest.trackingData

    def onError(formWithErrors: Form[(String, String, String, Boolean, Boolean)]): Future[Result] = {
      logger.info("Invalid registration request")
      Future.successful(redirectToRegistrationPage(formWithErrors))
    }

    def onSuccess(form: (String, String, String, Boolean, Boolean)): Future[Result] = form match {
      case (email, username, password, gnmMarketing, thirdPartyMarketing) =>
        val user = userCreationService.createUser(email, username, password, gnmMarketing, thirdPartyMarketing, idRequest.clientIp)
        val registeredUser: Future[Response[User]] = api.register(user, trackingData)

        val result: Future[Result] = registeredUser flatMap {
          case Left(errors) =>
            val formWithError = errors.foldLeft(boundForm) { (form, error) =>
              error match {
                case Error(_, description, _, context) =>
                  form.withError(context.getOrElse(""), description)
              }
            }
            formWithError.fill(email,username,"",thirdPartyMarketing,gnmMarketing)
            Future.successful(redirectToRegistrationPage(formWithError))

          case Right(usr) =>
            val verifiedReturnUrl = returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl)
            val authResponse = api.authBrowser(EmailPassword(email, password, idRequest.clientIp), trackingData)
            val response: Future[Result] = signinService.getCookies(authResponse, rememberMe = false) map {
              case Left(errors) =>
                Ok(views.html.registrationConfirmation(page, idRequest, idUrlBuilder, verifiedReturnUrl))

              case Right(responseCookies) =>
                Ok(views.html.registrationConfirmation(page, idRequest, idUrlBuilder, verifiedReturnUrl)).withCookies(responseCookies:_*)
            }

            response
        }
        result
    }

    boundForm.fold[Future[Result]](onError, onSuccess)
  }

  private def redirectToRegistrationPage(formWithErrors: Form[(String, String, String, Boolean, Boolean)]) = NoCache(
    SeeOther(routes.RegistrationController.renderForm().url).flashing(
      clearPassword(formWithErrors).toFlash(registrationKey)
    )
  )


  private def clearPassword(formWithPassword: Form[(String, String, String, Boolean, Boolean)]) = {
    val dataWithoutPassword = formWithPassword.data + (passwordKey -> "")
    formWithPassword.copy(data = dataWithoutPassword)
  }
}
