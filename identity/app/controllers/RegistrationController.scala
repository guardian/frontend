package controllers

import client._
import common.ExecutionContexts
import com.google.inject.Inject
import com.gu.identity.model.User
import idapiclient.{ IdApiClient, EmailPassword }
import javax.inject.Singleton
import model.IdentityPage
import play.api.mvc._
import play.api.data._
import play.api.mvc.SimpleResult
import scala.concurrent.Future
import services._
import utils.{ RemoteAddress, SafeLogging }

@Singleton
class RegistrationController @Inject()( returnUrlVerifier : ReturnUrlVerifier,
                                     userCreationService : UserCreationService,
                                     api: IdApiClient,
                                     idRequestParser : IdRequestParser,
                                     idUrlBuilder : IdentityUrlBuilder,
                                     signinService : PlaySigninService  )
  extends Controller with ExecutionContexts with SafeLogging with RemoteAddress {

  val page = IdentityPage("/register", "Register", "register")

  val registrationForm = Form(
    Forms.tuple(
      "user.primaryEmailAddress" -> Forms.text,
      "user.publicFields.username" -> Forms.text,
      "user.password" -> Forms.text,
      "receive_gnm_marketing" -> Forms.boolean,
      "receive_third_party_marketing" -> Forms.boolean
    )
  )

  def renderForm = Action { implicit request =>
    logger.trace("Rendering registration form")

    val idRequest = idRequestParser(request)
    val filledForm = registrationForm.fill("","","",true,false)
    Ok(views.html.registration(page.registrationStart(idRequest), idRequest, idUrlBuilder, filledForm ))
  }

  def processForm = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = registrationForm.bindFromRequest
    val omnitureData = idRequest.omnitureData

    def onError(formWithErrors: Form[(String, String, String, Boolean, Boolean)]): Future[SimpleResult] = {
      logger.info("Invalid registration request")
      Future {
        Ok(views.html.registration(page.registrationError(idRequest), idRequest, idUrlBuilder, formWithErrors))
      }
    }

    def onSuccess(form: (String, String, String, Boolean, Boolean)): Future[SimpleResult] = form match {
      case (email, username, password, gnmMarketing, thirdPartyMarketing) => {
        val user = userCreationService.createUser(email, username, password, gnmMarketing, thirdPartyMarketing, clientIp(request))
        val registeredUser: Future[Response[User]] = api.register(user, omnitureData, clientIp(request))

        val result: Future[SimpleResult] = registeredUser flatMap {
          case Left(errors) =>
            val formWithError = errors.foldLeft(boundForm) { (form, error) =>
              error match {
                case Error(_, description, _, context) =>
                  form.withError(context.getOrElse(""), description)
              }
            }
            formWithError.fill(email,username,"",thirdPartyMarketing,gnmMarketing)
            Future { Ok(views.html.registration(page.registrationError(idRequest), idRequest, idUrlBuilder, formWithError)) }

          case Right(user) =>
            val verifiedReturnUrl = returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl)
            val authResponse = api.authBrowser(EmailPassword(email, password), omnitureData)
            val response: Future[SimpleResult] = signinService.getCookies(authResponse, false) map {
              case Left(errors) => {
                Ok(views.html.registration_confirmation(page, idRequest, idUrlBuilder, verifiedReturnUrl))
              }
              case Right(responseCookies) => {
                Ok(views.html.registration_confirmation(page, idRequest, idUrlBuilder, verifiedReturnUrl)).withCookies(responseCookies:_*)
              }
            }

            response
        }

        result
      }
    }

    boundForm.fold[Future[SimpleResult]](onError, onSuccess)
  }
}
