package controllers.admin

import common.ExecutionContexts
import conf.Configuration
import controllers.{AuthAction, Identity, LoginController, NonAuthAction}
import play.api.mvc._
import play.api.libs.openid.OpenID

object Authenticated extends AuthAction(routes.Login.login.url)

object Login extends LoginController with Controller with ExecutionContexts {

  val loginUrl: String = routes.Login.login.url
  val baseUrl: String = "/admin"

  def openIdCallback(secure: Boolean)(implicit request: RequestHeader): String = routes.Login.openIDCallback.absoluteURL(secure)

  def login = NonAuthAction {
    request =>
      val error = request.flash.get("error")
      Ok(views.html.auth.login(request, error, Configuration.environment.stage))
  }
}
