package controllers.admin

import com.gu.googleauth.{Actions, GoogleAuthConfig, UserIdentity}
import play.api.mvc.Security.{AuthenticatedBuilder, AuthenticatedRequest}
import play.api.mvc._
import model.{ApplicationContext, NoCache}
import play.api.libs.ws.WSClient

import scala.concurrent.Future

class AuthActions(val wsClient: WSClient, val controllerComponents: ControllerComponents) extends Actions {

  override def authConfig: GoogleAuthConfig = conf.GoogleAuth.getConfigOrDie

  val loginTarget: Call = routes.OAuthLoginAdminController.login()
  val defaultRedirectTarget: Call = routes.OAuthLoginAdminController.login()
  val failureRedirectTarget: Call = routes.OAuthLoginAdminController.login()

  private val authenticatedBuilder: AuthenticatedBuilder[UserIdentity] = AuthenticatedBuilder(
    r => UserIdentity.fromRequest(r),
    controllerComponents.parsers.default,
    r => sendForAuth(r)
  )(controllerComponents.executionContext)

  def async(block: AuthenticatedRequest[AnyContent, UserIdentity] => Future[Result]): Action[AnyContent] = authenticatedBuilder.async(block)

}

class AdminIndexController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController {

  def index() = Action { Redirect("/admin") }

  def admin() = Action { implicit request =>
    NoCache(Ok(views.html.admin()))
  }
}
