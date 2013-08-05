package controllers

import play.api.mvc._
import play.api.data.Forms
import play.api.data._
import play.api.data.validation.Constraints._
import model.IdentityPage
import play.api.data.Form
import common.ExecutionContexts
import services.ReturnUrlVerifier
import com.google.inject.{Inject, Singleton}


@Singleton
class SigninController @Inject()(returnUrlVerifier: ReturnUrlVerifier) extends Controller with ExecutionContexts {

  val page = new IdentityPage("/signin", "Sign in", "signin")

  val form = Form(
    Forms.tuple(
      "email" -> Forms.email.verifying(nonEmpty),
      "password" -> Forms.nonEmptyText(6, 20).verifying(nonEmpty),
      "keepMeSignedIn" -> Forms.boolean
    )
  )

  def renderForm = Action { implicit request =>
    val filledForm = form.fill("", "", true)
    Ok(views.html.signin(page, filledForm))
  }

  def processForm = Action { implicit request =>
    form.bindFromRequest.fold(
      formWithErrors => BadRequest(views.html.signin(page, formWithErrors)),
      { case (email, password, rememberMe) => {
        TemporaryRedirect(returnUrlVerifier.getVerifiedReturnUrl(request))
        // call ID API
        if (true) {
          // get a cookie back from api client

          Ok("response")
//            .withCookies(
//              new Cookie("GU_U", GU_U_val, )
//            )
        } else {
          // invalid username / password
          Ok("Invalid! email: %s, password: %s, rememberMe: %s".format(email, password, rememberMe.toString))
        }
      }}
    )
  }
}
