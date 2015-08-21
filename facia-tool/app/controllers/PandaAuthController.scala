package controllers

import play.api.mvc.{Action, Controller}
import scala.concurrent.ExecutionContext.Implicits.global
import com.gu.googleauth.{UserIdentity, GoogleAuth, GoogleAuthConfig}
import scala.concurrent.Future
import play.api.libs.json.Json
import conf.Configuration
import org.joda.time.{Duration, DateTime}
import play.Play
import auth.PanDomainAuthActions

object PandaAuthController extends Controller with PanDomainAuthActions {

  def oauthCallback = Action.async { implicit request =>
    processGoogleCallback()
  }

  def logout = Action.async { implicit request =>
    Future(processLogout)
  }

  def authError(message: String) = Action.async { implicit request =>
    Future(Forbidden(views.html.auth.login(Some(message))))
  }

  def user() = AuthAction { implicit request =>
    Ok(request.user.toJson).as(JSON)
  }

  def status = AuthAction { request =>
    val user = request.user
    Ok(views.html.auth.status(user.toJson))
  }
}
