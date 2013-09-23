package controllers

import com.google.inject.Inject
import services._
import idapiclient.IdApiClient
import play.api.mvc._
import common.ExecutionContexts
import utils.{RemoteAddress, SafeLogging}
import javax.inject.Singleton
import model.IdentityPage
import play.api.data._
import idapiclient.EmailPassword
import client.Error

@Singleton
class RegistrationController @Inject()( returnUrlVerifier : ReturnUrlVerifier,
                                     userCreationService : UserCreationService,
                                     api: IdApiClient,
                                     idRequestParser : IdRequestParser,
                                     idUrlBuilder : IdentityUrlBuilder,
                                     signinService : PlaySigninService  )
  extends Controller with ExecutionContexts with SafeLogging with RemoteAddress {

  val page = new IdentityPage("/register", "Register", "register")

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
    Ok(views.html.registration(page, idRequest, idUrlBuilder, filledForm ))
  }

  def processForm = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = registrationForm.bindFromRequest
    val omnitureData = idRequest.omnitureData
    boundForm.fold(
      formWithErrors => {
        logger.info("Invalid registration request")
        Ok(views.html.registration(page, idRequest, idUrlBuilder, formWithErrors ))
      },
      {
        case(email, username, password, gnmMarketing, thirdPartyMarketing) => {
          val user = userCreationService.createUser(email, username, password, gnmMarketing, thirdPartyMarketing)
          Async {
            api.register(user, omnitureData, clientIp(request)) map ( _ match {
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
                Async {
                  val authResponse = api.authBrowser(EmailPassword(email, password), omnitureData)
                  signinService.getCookies(authResponse, false ) map ( _ match {
                    case Left(errors) => {
                      Ok(views.html.registration_confirmation(page, idRequest, idUrlBuilder, verifiedReturnUrl))
                    }
                    case Right(responseCookies) => {
                      Ok(views.html.registration_confirmation(page, idRequest, idUrlBuilder, verifiedReturnUrl)).withCookies(responseCookies:_*)
                    }
                  })
                }
              }
            })
          }
        }
      }
    )
  }
}
