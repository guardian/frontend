package controllers

import play.api.mvc._
import play.api.data._
import play.api.data.validation.Constraints
import model.IdentityPage
import common.{Logging, ExecutionContexts}
import services.{IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import com.google.inject.{Inject, Singleton}
import idapiclient.{ClientAuth, IdApiClient, EmailPassword}
import org.joda.time._
import conf.IdentityConfiguration
import play.api.i18n.Messages
import idapiclient.ClientAuth
import play.api.data.FormError
import scala.Some
import idapiclient.EmailPassword
import play.api.mvc.Cookie
import utils.SafeLogging
import form.Mappings.{idEmail, idPassword}


@Singleton
class SigninController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                 api: IdApiClient,
                                 conf: IdentityConfiguration,
                                 idRequestParser: IdRequestParser,
                                 idUrlBuilder: IdentityUrlBuilder)
  extends Controller with ExecutionContexts with SafeLogging {

  val page = new IdentityPage("/signin", "Sign in", "signin")

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

  def processForm = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = form.bindFromRequest
    boundForm.fold(
      formWithErrors => {
        logger.info("Invalid login form submission")
        Ok(views.html.signin(page, idRequest, idUrlBuilder, formWithErrors))
      },
      { case (email, password, rememberMe) => {
        logger.trace("authing with ID API")
        Async {
          api.authBrowser(EmailPassword(email, password), idRequest.omnitureData) map(_ match {
            case Left(errors) => {
              logger.error(errors.toString())
              logger.info("Auth failed for user")
              val formWithErrors = boundForm.withError(FormError("", Messages("error.login")))
              Ok(views.html.signin(page, idRequest, idUrlBuilder, formWithErrors))
            }
            case Right(apiCookiesResponse) => {
              logger.trace("Logging user in")
              val maxAge = if(rememberMe) Some(Seconds.secondsBetween(DateTime.now, apiCookiesResponse.expiresAt).getSeconds) else None
              val responseCookies = apiCookiesResponse.values.map { cookie =>
                val secureHttpOnly = cookie.key.startsWith("SC_")
                new Cookie(cookie.key, cookie.value, maxAge, "/", Some(conf.id.domain), secureHttpOnly, secureHttpOnly)
              }
              SeeOther(returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl))
                .withCookies(responseCookies:_*)
            }
          })
        }
      }}
    )
  }
}
