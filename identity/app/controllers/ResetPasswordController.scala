package controllers

import common.ExecutionContexts
import model.IdentityPage
import play.api.data.{Forms, Form}
import play.api.mvc._
import com.google.inject.{Inject, Singleton}
import idapiclient.SynchronousIdApi


@Singleton
class ResetPasswordController @Inject()( idApi : SynchronousIdApi ) extends Controller with ExecutionContexts {

  val page = new IdentityPage("/reset-password", "Reset Password", "reset-password")

  val form = Form(
      Forms.single(
        "email" -> Forms.email
      )
  )

  def renderPasswordResetRequestForm = Action { implicit request =>
    form.fill("")
    Ok(views.html.reset_password(page, form))
  }

  def processPasswordResetRequestForm = Action { implicit request =>
    form.bindFromRequest.fold(
        formWithErrors => BadRequest(views.html.reset_password(page, form)),
        {
          case ( email ) => Ok("Reset: %s".format(email))
        }
    )

  }

}
