package controllers

import play.api.mvc._
import play.api.data._
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


@Singleton
class SigninController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                 api: IdApiClient,
                                 conf: IdentityConfiguration,
                                 idRequestParser: IdRequestParser,
                                 idUrlBuilder: IdentityUrlBuilder)
  extends Controller with ExecutionContexts with Logging {

  val page = new IdentityPage("/signin", "Sign in", "signin")

  val form = Form(
    Forms.tuple(
      "email" -> Forms.email,
      "password" -> Forms.text
        .verifying(Messages("error.passwordLength"), {value => 6 <= value.length && value.length <= 20}),
      "keepMeSignedIn" -> Forms.boolean
    )
  )

  def renderForm = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val filledForm = form.fill("", "", true)
    Ok(views.html.signin(page, idRequest, idUrlBuilder, filledForm))
  }

  def processForm = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = form.bindFromRequest
    boundForm.fold(
      formWithErrors => {
        log.info("Invalid login form submission")
        Ok(views.html.signin(page, idRequest, idUrlBuilder, formWithErrors))
      },
      { case (email, password, rememberMe) => {
        log.trace("authing with ID API")
        Async {
          api.authBrowser(EmailPassword(email, password), ClientAuth(conf.id.apiClientToken), idRequest.omnitureData) map(_ match {
            case Left(errors) => {
              log.error(errors.toString)
              log.info("Auth failed for %s".format(email))
              val formWithErrors = boundForm.withError(FormError("", Messages("error.login")))
              Ok(views.html.signin(page, idRequest, idUrlBuilder, formWithErrors))
            }
            case Right(apiCookiesResponse) => {
              log.trace("Logging user in")
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
