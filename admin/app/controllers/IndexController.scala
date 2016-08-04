package controllers.admin

import com.gu.googleauth.{GoogleAuthConfig, UserIdentity, Actions}
import conf.Configuration
import play.api.mvc.Security.AuthenticatedBuilder
import play.api.mvc.{Call, Action, Controller}
import model.NoCache

object AuthActions extends Actions {

  override def authConfig: GoogleAuthConfig = conf.GoogleAuth.getConfigOrDie

  val loginTarget: Call = routes.OAuthLoginAdminController.login()

  object AuthActionTest extends AuthenticatedBuilder(r =>
    UserIdentity.fromRequest(r), r => sendForAuth(r)
  )
}

class AdminIndexController extends Controller {

  def index() = Action { Redirect("/admin") }

  def admin() = Action { implicit request =>
    NoCache(Ok(views.html.admin(Configuration.environment.stage)))
  }
}
