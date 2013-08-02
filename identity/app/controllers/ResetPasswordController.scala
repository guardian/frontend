package controllers

import common.ExecutionContexts
import model.IdentityPage
import play.api.data.{Forms, Form}
import play.api.mvc._
import com.google.inject.Singleton

@Singleton
class ResetPasswordController extends Controller with ExecutionContexts {

  val page = new IdentityPage("https://profile.theguardian.com/reset-password", "/reset-password", "Reset Password", "reset-password")

  val form = Form(
      Forms.single(
        "email" -> Forms.email
      )
  )

  def renderForm = Action { implicit request =>
    form.fill("")
    Ok(views.html.reset_password(page, form))
  }

  def processForm = Action { implicit request =>
    form.bindFromRequest.fold(
        formWithErrors => BadRequest(views.html.reset_password(page, form)),
        {
          case ( email ) => Ok("Reset: %s".format(email))
        }
    )

  }

}
