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
import play.api.data.validation._
import play.api.data.Forms._
import play.api.data.format.Formats._


import form.Mappings.{idEmail, idPassword}


@Singleton
class ResetPasswordController @Inject()( api : IdApiClient, idRequestParser: IdRequestParser, idUrlBuilder: IdentityUrlBuilder ) extends Controller with ExecutionContexts with Logging {

  val page = new IdentityPage("/reset-password", "Reset Password", "reset-password")

  val requestPasswordResetForm = Form(
    Forms.single(
      "email-address" -> of[String].verifying(Constraints.nonEmpty)
    )
  )

  val passwordResetForm = Form(
    Forms.tuple (
      "password" ->  idPassword
        .verifying(Constraints.nonEmpty),
      "password-confirm" ->  idPassword
        .verifying(Constraints.nonEmpty),
      "email-address" -> of[String].verifying(Constraints.nonEmpty)
    ) verifying(Messages("error.passwordsMustMatch"), { f => f._1 == f._2 }  )
  )

  def renderPasswordResetRequestForm = Action { implicit request =>
    val idRequest = idRequestParser(request)
    Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, requestPasswordResetForm, Nil))
  }

  def requestNewToken = Action { implicit request =>
    val idRequest = idRequestParser(request)
    Ok(views.html.password.reset_password_request_new_token(page, idRequest, idUrlBuilder, requestPasswordResetForm))
  }


  def processPasswordResetRequestForm = Action { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = requestPasswordResetForm.bindFromRequest
    boundForm.fold(
      formWithErrors => {
        log.info("bad password reset request form submission")
        Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, formWithErrors, Nil))
      },
      { case(email) => {
        Async {
          api.sendPasswordResetEmail(email) map(_ match {
            case Left(errors) => {
              log.info("User not found for request new password.")
              val formWithError = errors.foldLeft(boundForm) { (form, error) =>
                error match {
                  case Error(_, description, _, context) =>
                    form.withError(context.getOrElse(""), description)
                }
              }
              Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, formWithError, errors))
            }
            case Right(apiOk) => Ok(views.html.password.email_sent(page, idRequest, idUrlBuilder,  email))
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
                 case List( Error("Token expired", _, _, _)) =>
                   Ok(views.html.password.reset_password_request_new_token(page, idRequest, idUrlBuilder, requestPasswordResetForm))
                 case errors => {
                   val formWithError = errors.foldLeft(requestPasswordResetForm) { (form, error) =>
                     form.withError(error.context.getOrElse(""), error.description)
                   }
                   Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, formWithError, errors))
                 }
               }
             }

             case Right(ok) => Ok(views.html.password.password_reset_confirmation(page, idRequest, idUrlBuilder))})
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
          log.warn("Could not retrieve password reset request for token: %s".format(token))
          Ok(views.html.password.reset_password_request_new_token(page, idRequest, idUrlBuilder, requestPasswordResetForm))
        }
        case Right(user) => {
          val filledForm = passwordResetForm.fill("","", user.primaryEmailAddress)
          Ok(views.html.password.reset_password(page, idRequest, idUrlBuilder, filledForm, token))
        }
     })
    }
  }
}
