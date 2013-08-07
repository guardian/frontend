package controllers

import play.api.mvc._
import play.api.data._
import model.IdentityPage
import common.{Logging, ExecutionContexts}
import services.{IdRequestParser, ReturnUrlVerifier}
import com.google.inject.{Inject, Singleton}
import idapiclient.{IdApiClient, EmailPassword}
import org.joda.time.Duration
import conf.IdentityConfiguration
import play.api.i18n.Messages


@Singleton
class SigninController @Inject()(returnUrlVerifier: ReturnUrlVerifier, api: IdApiClient, conf: IdentityConfiguration, requestParser: IdRequestParser)
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
    val filledForm = form.fill("", "", true)
    Ok(views.html.signin(page, filledForm))
  }

  def processForm = Action { implicit request =>
    val idRequest = requestParser(request)
    val boundForm = form.bindFromRequest
    boundForm.fold(
      formWithErrors => {
        log.info("Invalid login form submission")
        Ok(views.html.signin(page, formWithErrors))
      },
      { case (email, password, rememberMe) => {
        log.trace("authing with ID API")
        Async {
          api.authBrowser(EmailPassword(email, password), idRequest.omnitureData) map(_ match {
            case Left(errors) => {
              log.info("Auth failed for %s".format(email))
              val formWithErrors = boundForm.withError(FormError("", Messages("error.login")))
              Ok(views.html.signin(page, formWithErrors))
            }
            case Right(apiCookies) => {
              log.trace("Logging user in")
              val responseCookies = apiCookies.map { cookie =>
                val maxAge = if(rememberMe) Some(Duration.standardDays(90).getStandardSeconds.toInt) else None
                val secureHttpOnly = cookie.name.startsWith("SC_")
                new Cookie(cookie.name, cookie.value, maxAge, "/", Some(conf.id.domain), secureHttpOnly, secureHttpOnly)
              }
              SeeOther(returnUrlVerifier.getVerifiedReturnUrl(request))
                .withCookies(responseCookies:_*)
            }
          })
        }
      }}
    )
  }
}
