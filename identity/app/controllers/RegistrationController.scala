package controllers

import client._
import common.ExecutionContexts
import com.google.inject.Inject
import com.gu.identity.model.User
import utils.{ThirdPartyConditions, SafeLogging}
import idapiclient.{ IdApiClient, EmailPassword }
import javax.inject.Singleton
import model.{NoCache, IdentityPage}
import play.api.i18n.MessagesApi
import play.api.mvc._
import play.api.data._
import scala.concurrent.Future
import services._
import utils.SafeLogging
import form.Mappings
import tracking.Omniture

@Singleton
class RegistrationController @Inject()( returnUrlVerifier : ReturnUrlVerifier,
                                     userCreationService : UserCreationService,
                                     api: IdApiClient,
                                     idRequestParser : TorNodeLoggingIdRequestParser,
                                     idUrlBuilder : IdentityUrlBuilder,
                                     signinService : PlaySigninService,
                                     val messagesApi: MessagesApi )
  extends Controller with ExecutionContexts with SafeLogging with Mappings with implicits.Forms {

  val page = IdentityPage("/register", "Register", "register")

  private val passwordKey = "user.password"
  private val emailKey = "user.primaryEmailAddress"

  val registrationForm = Form(
    Forms.tuple(
      "user.firstName" -> Forms.text,
      "user.secondName" -> Forms.text,
      emailKey -> Forms.text,
      "user.publicFields.username" -> Forms.text,
      passwordKey -> Forms.text,
      "receive_gnm_marketing" -> Forms.boolean,
      "receive_third_party_marketing" -> Forms.boolean
    )
  )

  val registrationFormWithConstraints = Form(
    Forms.tuple(
      "user.firstName" -> idFirstName,
      "user.secondName" -> idSecondName,
      emailKey -> idRegEmail,
      "user.publicFields.username" -> Forms.text,
      passwordKey -> idPassword,
      "receive_gnm_marketing" -> Forms.boolean,
      "receive_third_party_marketing" -> Forms.boolean
    )
  )

  def renderForm(returnUrl: Option[String], skipConfirmation: Option[Boolean], group: Option[String] = None) = Action { implicit request =>
    logger.trace("Rendering registration form")

    val idRequest = idRequestParser(request)
    val filledForm = registrationForm.bindFromFlash.getOrElse(registrationForm.fill("", "", "", "", "", true, false))
    val registrationError = request.getQueryString("error")
    val groupCode = idRequest.groupCode.orElse(group)

    NoCache(Ok(views.html.registration(Omniture.registrationStart(page, idRequest), idRequest, idUrlBuilder, filledForm, registrationError, groupCode)))
  }

  def renderRegistrationConfirmation(returnUrl: String) = Action{ implicit request =>
    val idRequest = idRequestParser(request)
    val verifiedReturnUrl = returnUrlVerifier.getVerifiedReturnUrl(returnUrl).getOrElse(returnUrlVerifier.defaultReturnUrl)
    NoCache(Ok(views.html.registrationConfirmation(page, idRequest, idUrlBuilder, verifiedReturnUrl)))
  }

  def processForm = Action.async { implicit request =>
    val boundForm = registrationFormWithConstraints.bindFromRequest
    val idRequest = idRequestParser(request, boundForm.data.getOrElse(emailKey,"unable to extract email from form data" ))
    val trackingData = idRequest.trackingData
    val skipConfirmation = idRequest.skipConfirmation

    def onError(formWithErrors: Form[(String, String, String, String, String, Boolean, Boolean)]): Future[Result] = {
      logger.info("Invalid registration request")
      formWithErrors.error("user.primaryEmailAddress") match {
        case Some(FormError("user.primaryEmailAddress", Seq("This domain is blacklisted"), _)) => {
          val emailAddressOrError = formWithErrors.data.getOrElse(emailKey," should be an email address")
          val clientIp = idRequest.clientIp.getOrElse("Could not get remote ip address")
          logger.info(s"Blocking registration from blacklisted domain here: Email: $emailAddressOrError Remote ip <$clientIp>")
          Future.successful(redirectToRegistrationPageWithoutErrors(formWithErrors, idRequest.returnUrl, skipConfirmation, idRequest.groupCode))
        }
        case _ =>
          Future.successful(redirectToRegistrationPage(formWithErrors, idRequest.returnUrl, skipConfirmation, idRequest.groupCode))
      }
    }

    def onSuccess(form: (String, String, String, String, String, Boolean, Boolean)): Future[Result] = form match {
      case (firstName, secondName, email, username, password, gnmMarketing, thirdPartyMarketing) =>
        val user = userCreationService.createUser(firstName, secondName, email, username, password, gnmMarketing, thirdPartyMarketing, idRequest.clientIp)
        val groupAgreeReturnUrlOpt = ThirdPartyConditions.agreeUrlOpt(idRequest, idUrlBuilder).orElse(idRequest.returnUrl)
        val registeredUser: Future[Response[User]] = api.register(user, trackingData, idRequest.returnUrl)

        val result: Future[Result] = registeredUser flatMap {
          case Left(errors) => {
            val formWithError = errors.foldLeft(boundForm) { (form, error) =>
              error match {
                case Error(_, description, _, context) =>
                  form.withError(context.getOrElse(""), description)
              }
            }
            formWithError.fill(firstName, secondName, email, username, "", thirdPartyMarketing, gnmMarketing)
            Future.successful(redirectToRegistrationPage(formWithError, idRequest.returnUrl, skipConfirmation, idRequest.groupCode))
          }

          case Right(usr) => {
            val finalVerifiedReturnUrl = idRequest.returnUrl.getOrElse(returnUrlVerifier.defaultReturnUrl)
            val authResponse = api.authBrowser(EmailPassword(email, password, idRequest.clientIp), trackingData)
            val response: Future[Result] = signinService.getCookies(authResponse, rememberMe = true) map {
              case Left(errors) => {
                NoCache(SeeOther(routes.RegistrationController.renderRegistrationConfirmation(finalVerifiedReturnUrl).url))
              }

              case Right(responseCookies) => {
                (idRequest.groupCode, skipConfirmation.getOrElse(false)) match {
                  case (Some(validGroupCode), false) => {
                    val registrationConfirmationUrl = idUrlBuilder.buildUrl(routes.RegistrationController.renderRegistrationConfirmation(finalVerifiedReturnUrl).url)
                    val agreeUrl = idUrlBuilder.buildUrl(ThirdPartyConditions.agreeUrl(validGroupCode), idRequest, ("skipThirdPartyLandingPage", "true"), ("returnUrl", registrationConfirmationUrl))
                    Redirect(agreeUrl).withCookies(responseCookies: _*)
                  }
                  case (Some(validGroupCode), true) => {
                    val agreeUrl = idUrlBuilder.buildUrl(ThirdPartyConditions.agreeUrl(validGroupCode), idRequest, ("skipThirdPartyLandingPage", "true"))
                    Redirect(agreeUrl).withCookies(responseCookies: _*)
                  }
                  case (None, true) => Redirect(finalVerifiedReturnUrl).withCookies(responseCookies: _*)
                  case (None, false) => NoCache(SeeOther(routes.RegistrationController.renderRegistrationConfirmation(finalVerifiedReturnUrl).url)).withCookies(responseCookies: _*)
                }
              }
            }
            response
          }
        }
        result
    }

    boundForm.fold[Future[Result]](onError, onSuccess)
  }

  private def redirectToRegistrationPage(formWithErrors: Form[(String, String, String, String, String, Boolean, Boolean)],
                                         returnUrl: Option[String], skipConfirmation: Option[Boolean], groupCode: Option[String]) = NoCache(
    SeeOther(routes.RegistrationController.renderForm(returnUrl, skipConfirmation, groupCode).url).flashing(
      clearPassword(formWithErrors).toFlash
    )
  )

  private def redirectToRegistrationPageWithoutErrors(formWithErrors: Form[(String, String, String, String, String, Boolean, Boolean)],
                                                      returnUrl: Option[String], skipConfirmation: Option[Boolean], groupCode: Option[String]) = NoCache(
    SeeOther(routes.RegistrationController.renderForm(returnUrl, skipConfirmation, groupCode).url).flashing(formWithErrors.toFlashWithDataDiscarded)
  )


  private def clearPassword(formWithPassword: Form[(String, String, String, String, String, Boolean, Boolean)]) = {
    val dataWithoutPassword = formWithPassword.data + (passwordKey -> "")
    formWithPassword.copy(data = dataWithoutPassword)
  }
}
