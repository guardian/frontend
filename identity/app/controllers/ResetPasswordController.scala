package controllers

import common.ExecutionContexts
import model.IdentityPage
import play.api.data.{Forms, Form}
import play.api.mvc._
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import services.{IdentityUrlBuilder, IdRequestParser}
import play.api.i18n.Messages
import play.api.data.validation._
import play.api.data.Forms._
import play.api.data.format.Formats._
import form.Mappings.idPassword
import utils.SafeLogging
import scala.concurrent.Future


@Singleton
class ResetPasswordController @Inject()( api : IdApiClient, idRequestParser: IdRequestParser, idUrlBuilder: IdentityUrlBuilder )
  extends Controller with ExecutionContexts with SafeLogging {

  val page = IdentityPage("/reset-password", "Reset Password", "reset-password")

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


  def processPasswordResetRequestForm = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = requestPasswordResetForm.bindFromRequest

    def onError(formWithErrors: Form[(String)]): Future[SimpleResult] = {
      logger.info("bad password reset request form submission")
      Future {
        Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, formWithErrors, Nil))
      }
    }

    def onSuccess(form: (String)): Future[SimpleResult] = form match {
      case (email) =>
        api.sendPasswordResetEmail(email, idRequest.trackingData) map {
          case Left(errors) =>
            logger.info(s"Request new password returned errors ${errors.toString()}")
            val formWithError = errors.foldLeft(boundForm) { (form, error) =>
              form.withError(error.context.getOrElse(""), error.description)
            }
            Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, formWithError, errors))

          case Right(apiOk) => Ok(views.html.password.email_sent(page, idRequest, idUrlBuilder,  email))
        }
    }

    boundForm.fold[Future[SimpleResult]](onError, onSuccess)
  }

  def resetPassword(token : String) = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = passwordResetForm.bindFromRequest

    def onError(formWithErrors: Form[(String, String, String)]): Future[SimpleResult] = {
      logger.info("form errors in reset password attempt")
      Future {
        Ok(views.html.password.reset_password(page, idRequest, idUrlBuilder, formWithErrors, token))
      }
    }

    def onSuccess(form: (String, String, String)): Future[SimpleResult] = form match {
      case (password, password_confirm, email_address) =>
        api.resetPassword(token,password) map {
          case Left(errors) =>
            logger.info(s"reset password errors, ${errors.toString()}")
            if (errors.exists("Token expired" == _.message))
              Ok(views.html.password.reset_password_request_new_token(page, idRequest, idUrlBuilder, requestPasswordResetForm))
            else {
              val formWithError = errors.foldLeft(requestPasswordResetForm) { (form, error) =>
                form.withError(error.context.getOrElse(""), error.description)
              }
              Ok(views.html.password.request_password_reset(page, idRequest, idUrlBuilder, formWithError, errors))
            }

          case Right(ok) => Ok(views.html.password.password_reset_confirmation(page, idRequest, idUrlBuilder))
        }
    }

    boundForm.fold[Future[SimpleResult]](onError, onSuccess)
  }

  def processUpdatePasswordToken( token : String) = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
      api.userForToken(token) map {
        case Left(errors) =>
          logger.warn(s"Could not retrieve password reset request for token: $token, errors: ${errors.toString()}")
          Ok(views.html.password.reset_password_request_new_token(page, idRequest, idUrlBuilder, requestPasswordResetForm))

        case Right(user) =>
          val filledForm = passwordResetForm.fill("","", user.primaryEmailAddress)
          Ok(views.html.password.reset_password(page, idRequest, idUrlBuilder, filledForm, token))
     }
  }
}
