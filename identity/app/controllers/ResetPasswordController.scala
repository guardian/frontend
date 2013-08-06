package controllers

import common.ExecutionContexts
import model.IdentityPage
import play.api.data.{Forms, Form}
import play.api.mvc._
import com.google.inject.{Inject, Singleton}
import idapiclient.{EmailPassword, Email, IdApiClient}
import org.joda.time.Duration


@Singleton
class ResetPasswordController @Inject()( api : IdApiClient ) extends Controller with ExecutionContexts {

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
    val boundForm = form.bindFromRequest
    boundForm.fold(
        formWithErrors => BadRequest(views.html.reset_password(page, form)),
        {
          case(email) => {
            api.email(Email(email)) map( _ match {
              case Left(errors) => {
                Ok(views.html.reset_password(page, boundForm))
              }
              case Right(user) => {Ok("gotcha")}
            })
          }
        }
    )
  }
}
