package controllers

import play.api.mvc._
import play.api.data._
import play.api.data.validation.Constraints
import model.IdentityPage
import common.ExecutionContexts
import services.{PlaySigninService, IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import play.api.i18n.Messages
import idapiclient.EmailPassword
import utils.SafeLogging
import form.Mappings.{idEmail, idPassword}
import scala.concurrent.Future


@Singleton
class SigninController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                 api: IdApiClient,
                                 idRequestParser: IdRequestParser,
                                 idUrlBuilder: IdentityUrlBuilder,
                                 signInService : PlaySigninService)
  extends Controller with ExecutionContexts with SafeLogging {

  val page = IdentityPage("/signin", "Sign in", "signin")

  val form = Form(
    Forms.tuple(
      "email" -> idEmail
        .verifying(Constraints.nonEmpty),
      "password" -> idPassword
        .verifying(Constraints.nonEmpty),
      "keepMeSignedIn" -> Forms.boolean
    )
  )

  def renderForm = Action { implicit request =>
    logger.trace("Rendering signin form")
    val idRequest = idRequestParser(request)
    val filledForm = form.fill("", "", true)
    Ok(views.html.signin(page, idRequest, idUrlBuilder, filledForm))
  }

  def processForm = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = form.bindFromRequest

    def onError(formWithErrors: Form[(String, String, Boolean)]): Future[SimpleResult] = {
      logger.info("Invalid login form submission")
      Future {
        Ok(views.html.signin(page, idRequest, idUrlBuilder, formWithErrors))
      }
    }

    def onSuccess(form: (String, String, Boolean)): Future[SimpleResult] = form match {
      case (email, password, rememberMe) =>
        logger.trace("authing with ID API")
        val authResponse = api.authBrowser(EmailPassword(email, password), idRequest.omnitureData)
        signInService.getCookies(authResponse, rememberMe) map {
          case Left(errors) => {
            logger.error(errors.toString())
            logger.info(s"Auth failed for user, ${errors.toString()}")
            val formWithErrors = errors.foldLeft(boundForm) { (formFold, error) =>
              val errorMessage =
                if ("Invalid email or password" == error.message) Messages("error.login")
                else error.description
              formFold.withError(error.context.getOrElse(""), errorMessage)
            }
            Ok(views.html.signin(page, idRequest, idUrlBuilder, formWithErrors))
          }
          case Right(responseCookies) => {
            logger.trace("Logging user in")
            SeeOther(returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl))
              .withCookies(responseCookies:_*)
          }
        }
    }

    boundForm.fold[Future[SimpleResult]](onError, onSuccess)
  }
}
