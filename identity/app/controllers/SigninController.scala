package controllers

import play.api.mvc._
import play.api.data.Forms
import model.IdentityPage
import play.api.data.Form
import common.ExecutionContexts
import services.ReturnUrlVerifier
import com.google.inject.{Inject, Singleton}
import idapiclient.{IdApiClient, EmailPassword}
import org.joda.time.Duration
import conf.IdentityConfiguration


@Singleton
class SigninController @Inject()(returnUrlVerifier: ReturnUrlVerifier, api: IdApiClient, conf: IdentityConfiguration)
  extends Controller with ExecutionContexts {

  val page = new IdentityPage("/signin", "Signin", "signin")

  val form = Form(
    Forms.tuple(
      "email" -> Forms.email,
      "password" -> Forms.nonEmptyText(6, 20),
      "keepMeSignedIn" -> Forms.boolean
    )
  )

  def renderForm = Action { implicit request =>
    val filledForm = form.fill("", "", true)
    Ok(views.html.signin(page, filledForm))
  }

  def processForm = Action { implicit request =>
    val boundForm = form.bindFromRequest
    boundForm.fold(
      formWithErrors => Ok(views.html.signin(page, formWithErrors)),
      { case (email, password, rememberMe) => {
        Async {
          api.authBrowser(EmailPassword(email, password)) map(_ match {
            case Left(errors) => {
              Ok(views.html.signin(page, boundForm))
            }
            case Right(apiCookies) => {
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
