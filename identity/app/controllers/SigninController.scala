package controllers

import utils.{ThirdPartyConditions, SafeLogging}
import ThirdPartyConditions._
import implicits.Forms
import play.api.mvc._
import play.api.data._
import play.api.data.validation.Constraints
import model.{NoCache, IdentityPage}
import common.ExecutionContexts
import services.{PlaySigninService, IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import play.api.i18n.{MessagesApi, Messages}
import idapiclient.EmailPassword
import utils.SafeLogging
import form.Mappings
import scala.concurrent.Future


@Singleton
class SigninController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                 api: IdApiClient,
                                 idRequestParser: IdRequestParser,
                                 idUrlBuilder: IdentityUrlBuilder,
                                 signInService : PlaySigninService,
                                 val messagesApi: MessagesApi)
  extends Controller with ExecutionContexts with SafeLogging with Mappings with Forms {

  val page = IdentityPage("/signin", "Sign in", "signin")

  val form = Form(
    Forms.tuple(
      "email" -> Forms.text,
      "password" -> Forms.text,
      "keepMeSignedIn" -> Forms.boolean
    )
  )

  val formWithConstraints = Form(
    Forms.tuple(
      "email" -> idEmail
        .verifying(Constraints.nonEmpty),
      "password" -> Forms.text
        .verifying(Constraints.nonEmpty),
      "keepMeSignedIn" -> Forms.boolean
    )
  )

  def renderForm(returnUrl: Option[String], group: Option[String] = None) = Action { implicit request =>

    val filledForm = form.bindFromFlash.getOrElse(form.fill("", "", true))

    logger.trace("Rendering signin form")
    val idRequest = idRequestParser(request)
    val groupCode = idRequest.groupCode.orElse(group)

    NoCache(Ok(views.html.signin(page, idRequest, idUrlBuilder, filledForm, groupCode)))
  }

  def processForm = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = formWithConstraints.bindFromRequest
    val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)

    def onError(formWithErrors: Form[(String, String, Boolean)]): Future[Result] = {
      logger.info("Invalid login form submission")
      Future.successful {
        redirectToSigninPage(formWithErrors, verifiedReturnUrlAsOpt, idRequest.groupCode)
      }
    }

    def onSuccess(form: (String, String, Boolean)): Future[Result] = form match {
      case (email, password, rememberMe) =>
        logger.trace("authing with ID API")
        val authResponse = api.authBrowser(EmailPassword(email, password, idRequest.clientIp), idRequest.trackingData, Some(rememberMe))
        signInService.getCookies(authResponse, rememberMe) map {
          case Left(errors) =>
            logger.error(errors.toString())
            logger.info(s"Auth failed for user, ${errors.toString()}")
            val formWithErrors = errors.foldLeft(boundForm) { (formFold, error) =>
              val errorMessage =
                if ("Invalid email or password" == error.message) Messages("error.login")
                else error.description
              formFold.withError(error.context.getOrElse(""), errorMessage)
            }

            redirectToSigninPage(formWithErrors, verifiedReturnUrlAsOpt, idRequest.groupCode)

          case Right(responseCookies) =>
            logger.trace("Logging user in")
            val finalReturnUrl = idRequest.groupCode match {
              case Some(validGroupCode) => idUrlBuilder.buildUrl(ThirdPartyConditions.agreeUrl(validGroupCode), idRequest, ("skipThirdPartyLandingPage", "true"))
              case _ => verifiedReturnUrlAsOpt.getOrElse(returnUrlVerifier.defaultReturnUrl)
            }
            SeeOther(finalReturnUrl)
              .withCookies(responseCookies: _*)

        }
    }

    boundForm.fold[Future[Result]](onError, onSuccess)
  }

  def redirectToSigninPage(formWithErrors: Form[(String, String, Boolean)], returnUrl: Option[String], groupCode: Option[String] = None): Result = {
    NoCache(SeeOther(routes.SigninController.renderForm(returnUrl, groupCode).url).flashing(clearPassword(formWithErrors).toFlash))
  }

  private def clearPassword(formWithPassword: Form[(String, String, Boolean)]) = {
    val dataWithoutPassword = formWithPassword.data + ("password" -> "")
    formWithPassword.copy(data = dataWithoutPassword)
  }
}
