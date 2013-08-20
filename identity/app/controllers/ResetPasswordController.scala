package controllers

import common.{ExecutionContexts, Logging}
import model.IdentityPage
import play.api.data.{Forms, Form}
import play.api.mvc._
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import client.Error
import services.{IdentityUrlBuilder, IdRequestParser}
import play.api.i18n.Messages


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
        .verifying(Messages("error.passwordLength"), {value => 6 <= value.length && value.length <= 20})
    ) verifying(Messages("error.passwordsMustMatch"), { f => f._1 == f._2 }  )
  )

  def renderPasswordResetRequestForm(message : String = "") = Action { implicit request =>
    requestPasswordResetForm.fill("")
    message match {
      case "tokenexpired" => Ok(views.html.request_password_reset(page, requestPasswordResetForm, "Looks like you left it too long. Please request a new password reset code"))
      case "passworderror" => Ok(views.html.request_password_reset(page, requestPasswordResetForm, "We could not reset your details. Please request a new password reset code"))
      case _ => Ok(views.html.request_password_reset(page, requestPasswordResetForm, ""))
    }
  }

  def processPasswordResetRequestForm = Action { implicit request =>
    val boundForm = requestPasswordResetForm.bindFromRequest
    boundForm.fold(
    formWithErrors => {
      log.info("bad password reset request form submission")
      Ok(views.html.request_password_reset(page, formWithErrors, ""))
    },
    { case(email) => {
        Async {
          api.sendPasswordResetEmail(email) map(_ match {
            case Left(errors) => {
              log.info("User not found for request new password.")
              Ok(views.html.reset_password_confirmation(page, "email", email))
            }
            case Right(apiOk) => Ok(views.html.reset_password_confirmation(page, "email",  email))
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
        Ok(views.html.reset_password(page, idRequest, idUrlBuilder, formWithErrors, token))
     },
     { case(password, password_confirm)  => {
         Async {
           api.resetPassword(token,password) map ( _ match {
             case Left(errors) => {
               errors match {
                 case List( Error("Token expired", _, _)) => SeeOther("/recover/tokenexpired")
                 case List( Error("Access Denied", _, _)) => SeeOther("/recover/passworderror")
                 case _ => SeeOther("/recover")
               }
             }
             case Right(ok) => Ok(views.html.reset_password_confirmation(page, "reset"))})
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
          SeeOther("/recover/tokenexpired")
        }
        case Right(user) => {
          passwordResetForm.fill("","")
          Ok(views.html.reset_password(page, idRequest, idUrlBuilder, passwordResetForm, token))
        }
     })
    }
  }
}
