package controllers.admin

import com.gu.googleauth.{GoogleAuthConfig, UserIdentity, Actions}
import conf.Configuration
import play.api.Play
import play.api.mvc.Security.AuthenticatedBuilder
import play.api.mvc.{Call, Action, Controller}
import model.NoCache

object AuthActions extends Actions {
  import play.api.Play.current

  override def authConfig: GoogleAuthConfig = conf.GoogleAuth.getConfigOrDie

  val loginTarget: Call = routes.OAuthLoginController.login()

  lazy val testUser = if (Play.isTest)
    Option(UserIdentity("1234", "foo@bar.com", "John", "Smith", 400, None))
  else
    None

  object AuthActionTest extends AuthenticatedBuilder(r =>
    UserIdentity.fromRequest(r).orElse(testUser), r => sendForAuth(r)
  )
}

object AdminIndexController extends Controller {

  def index() = Action { Redirect("/admin") }

  def admin() = AuthActions.AuthActionTest { request =>
    NoCache(Ok(views.html.admin(Configuration.environment.stage)))
  }
}
