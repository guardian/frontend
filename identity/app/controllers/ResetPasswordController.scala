package controllers

import common.{ExecutionContexts, Logging}
import model.IdentityPage
import play.api.data.{FormError, Forms, Form}
import play.api.mvc._
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import client.Error
import services.{IdentityUrlBuilder, IdRequestParser}
import play.api.i18n.Messages
import java.net.URLEncoder


@Singleton
class ResetPasswordController @Inject()( api : IdApiClient, idRequestParser: IdRequestParser, idUrlBuilder: IdentityUrlBuilder ) extends Controller with ExecutionContexts with Logging {

  val page = new IdentityPage("/reset-password", "Reset Password", "reset-password")

  val requestPasswordResetForm = Form(
    Forms.single(
      "email" -> Forms.email
    )
  )

  val passwordResetForm = Form(
    Forms.tuple (
      "password" ->  Forms.text
        .verifying(Messages("error.passwordLength"), {value => 6 <= value.length && value.length <= 20}),
      "password_confirm" ->  Forms.text
        .verifying(Messages("error.passwordLength"), {value => 6 <= value.length && value.length <= 20}),
      "email_address" -> Forms.text
    ) verifying(Messages("error.passwordsMustMatch"), { f => f._1 == f._2 }  )
  )

  def renderPasswordResetRequestForm(email : String = "") = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val filledForm = requestPasswordResetForm.fill(email)
    Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, filledForm))
  }

  def requestNewToken = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val filledForm = requestPasswordResetForm.fill("")
    Ok(views.html.password.reset_password_request_new_token(page, idRequest, idUrlBuilder, filledForm))
  }


  def processPasswordResetRequestForm = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = requestPasswordResetForm.bindFromRequest
    boundForm.fold(
    formWithErrors => {
      log.info("bad password reset request form submission")
      Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, formWithErrors))
    },
    { case(email) => {
        Async {
          api.sendPasswordResetEmail(email) map(_ match {
            case Left(errors) => {
              log.info("User not found for request new password.")
              Ok(views.html.password.reset_password_confirmation(page, idRequest, idUrlBuilder, "reset-error", email))
            }
            case Right(apiOk) => Ok(views.html.password.reset_password_confirmation(page, idRequest, idUrlBuilder, "email",  email))
          })
        }
       }
     })
  }

  def resetPassword(token : String) = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = passwordResetForm.bindFromRequest
    boundForm.fold(
      formWithErrors => {
        log.info("bad rest password attempt")
        Ok(views.html.password.reset_password(page, idRequest, idUrlBuilder, formWithErrors, token))
     },
     { case(password, password_confirm, email_address)  => {
         Async {
           api.resetPassword(token,password) map ( _ match {
             case Left(errors) => {
               errors match {
                 case List( Error("Token expired", _, _)) => SeeOther("/requestnewtoken")
                 case List( Error("Access Denied", _, _)) => {
                    val formWithError = requestPasswordResetForm.withError(FormError("", Messages("error.passwordReset")))
                   Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, formWithError))
                 }
                 case _ => SeeOther("/recover")
               }
             }

             case Right(ok) => Ok(views.html.password.reset_password_confirmation(page, idRequest, idUrlBuilder, "reset"))})
         }
       }
     }
   )
  }

  def processUpdatePasswordToken( token : String) = Action { implicit request =>
    val idRequest = idRequestParser(request)
    Async {
      api.userForToken(token) map ( _ match {
        case Left(errors) => {
          log.trace("Could not retrieve password reset request for token: %s".format(token))
          SeeOther("/requestnewtoken")
        }
        case Right(user) => {
          val filledForm = passwordResetForm.fill("","", user.primaryEmailAddress)
          Ok(views.html.password.reset_password(page, idRequest, idUrlBuilder, filledForm, token))
        }
     })
    }
  }
}
