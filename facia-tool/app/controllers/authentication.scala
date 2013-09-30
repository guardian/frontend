package controllers

import conf.Configuration
import common.ExecutionContexts
import play.api.mvc._
import play.api.libs.openid.OpenID
import scala.concurrent.Future

object Authenticated extends AuthAction(routes.Login.login.url) {
  def apply(f: Request[AnyContent] => SimpleResult): Action[AnyContent] = async(request => Future.apply(f(request)))
}

object Login extends Controller with ExecutionContexts {
  val openIdAttributes = Seq(
    ("email", "http://axschema.org/contact/email"),
    ("firstname", "http://axschema.org/namePerson/first"),
    ("lastname", "http://axschema.org/namePerson/last")
  )
  val googleOpenIdUrl = "https://www.google.com/accounts/o8/id"

  def login = NonAuthAction {
    request =>
      val error = request.flash.get("error")
      Ok(views.html.auth.login(request, error, Configuration.environment.stage))
  }

  def loginPost = Action.async { implicit request =>
    OpenID
      .redirectURL(googleOpenIdUrl, routes.Login.openIDCallback.absoluteURL(secure = true), openIdAttributes)
      .map(Redirect(_))
      .recover {
      case error => Redirect(routes.Login.login).flashing(("error" -> "Unknown error: %s ".format(error.getMessage)))
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
        Redirect(session.get("loginFromUrl").getOrElse("/admin")).withSession {
          session + (Identity.KEY -> credentials.writeJson) - "loginFromUrl"
        }
      } else {
        Redirect(routes.Login.login).flashing(
          ("error" -> "You can only log in using a Guardian Google Account")
        ).withSession(session - Identity.KEY)
      }
    }.recover {
      case error => Redirect(routes.Login.login).flashing(("error" -> "Unknown error: %s ".format(error.getMessage)))
    }
  }

  def logout = Action { implicit request =>
    Redirect("/login").withNewSession
  }
}
