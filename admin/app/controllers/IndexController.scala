package controllers.admin

import com.gu.googleauth.Actions
import conf.Configuration
import play.api.mvc.{Call, Action, Controller}
import model.NoCache


object AuthActions extends Actions {
  val loginTarget: Call = routes.OAuthLoginController.login()
}

object IndexController extends Controller {

  def index() = Action { Redirect("/admin") }

  def admin() = AuthActions.AuthAction { request =>
    NoCache(Ok(views.html.admin(Configuration.environment.stage)))
  }
}
