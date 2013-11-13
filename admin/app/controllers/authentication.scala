package controllers.admin

import common.ExecutionContexts
import conf.Configuration
import controllers.{AuthAction, LoginController}
import play.api.mvc._
import model.NoCache

object Authenticated extends AuthAction(routes.Login.login.url)

object Login extends LoginController with Controller with ExecutionContexts {

  val loginUrl: String = routes.Login.login.url
  val baseUrl: String = "/admin"

  def openIdCallback(secure: Boolean)(implicit request: RequestHeader): String = {
    routes.Login.openIDCallback.absoluteURL(secure && Configuration.environment.stage != "dev")
  }

  def login = Action {
    request =>
      val error = request.flash.get("error")
      NoCache(Ok(views.html.auth.login(error, Configuration.environment.stage)))
  }
}
