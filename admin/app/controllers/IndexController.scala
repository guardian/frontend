package controllers.admin

import com.gu.googleauth.{Actions, GoogleAuthConfig, UserIdentity}
import play.api.mvc.Security.AuthenticatedBuilder
import play.api.mvc._
import model.{ApplicationContext, NoCache}
import play.api.libs.ws.WSClient

class AuthActions(val wsClient: WSClient, val controllerComponents: ControllerComponents) extends Actions {

  override def authConfig: GoogleAuthConfig = conf.GoogleAuth.getConfigOrDie

  val loginTarget: Call = routes.OAuthLoginAdminController.login()
  val defaultRedirectTarget: Call = routes.OAuthLoginAdminController.login()
  val failureRedirectTarget: Call = routes.OAuthLoginAdminController.login()

  object AuthActionTest extends AuthenticatedBuilder(r =>
    UserIdentity.fromRequest(r), r => sendForAuth(r)
  )
}

class AdminIndexController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController {

  def index() = Action { Redirect("/admin") }

  def admin() = Action { implicit request =>
    NoCache(Ok(views.html.admin()))
  }
}
