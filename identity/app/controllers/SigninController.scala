package controllers

import play.api.mvc._
import play.api.data.Forms._
import model.IdentityPage
import play.api.data.Form
import common.ExecutionContexts
import services.ReturnUrlVerifier
import com.google.inject.{Inject, Singleton}


@Singleton
class SigninController @Inject()(returnUrlVerifier: ReturnUrlVerifier) extends Controller with ExecutionContexts {

  val page = new IdentityPage("https://profile.theguardian.com/signin", "/signin", "Signin", "signin")

  val form = Form(
    tuple(
      "email" -> email,
      "password" -> nonEmptyText(6, 20),
      "keepMeSignedIn" -> boolean
    )
  )

  def renderForm = Action { implicit request =>
    form.fill("", "", true)
    Ok(views.html.signin(page, form))
  }

  def processForm = Action { implicit request =>
    form.bindFromRequest.fold(
      formWithErrors => TemporaryRedirect(returnUrlVerifier.getVerifiedReturnUrl(request)),
      values => BadRequest(views.html.signin(page, form))
    )
  }
}
