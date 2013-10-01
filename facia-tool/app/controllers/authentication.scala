package controllers

import conf.Configuration
import common.ExecutionContexts
import play.api.mvc._
import play.api.libs.openid.OpenID
import scala.concurrent.Future

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

  def loginPost = Action.async { implicit request =>
    OpenID
      .redirectURL(googleOpenIdUrl, openIdCallback(secure=true), openIdAttributes)
      .map(Redirect(_))
      .recover {
      case error => Redirect(loginUrl).flashing(("error" -> "Unknown error: %s ".format(error.getMessage)))
    }
  }

  def openIDCallback = Action.async { implicit request =>
    OpenID.verifiedId.map { info =>
      val credentials = Identity(
        info.id,
        info.attributes.get("email").get,
        info.attributes.get("firstname").get,
        info.attributes.get("lastname").get
      )

      // allow test user access
      val isTestUser = (credentials.email == "test.automation@gutest.com" && List("dev", "code", "gudev").contains(Configuration.environment.stage.toLowerCase))

      if (credentials.emailDomain == "guardian.co.uk" || isTestUser) {
        Redirect(session.get("loginFromUrl").getOrElse(baseUrl)).withSession {
          session + (Identity.KEY -> credentials.writeJson) - "loginFromUrl"
        }
      } else {
        Redirect(loginUrl).flashing(
          ("error" -> "You can only log in using a Guardian Google Account")
        ).withSession(session - Identity.KEY)
      }
    }.recover {
      case error => Redirect(loginUrl).flashing(("error" -> "Unknown error: %s ".format(error.getMessage)))
    }
  }

  def logout = Action { implicit request =>
    Redirect(loginUrl).withNewSession
  }
}
