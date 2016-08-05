package controllers

import com.gu.googleauth.{GoogleAuthConfig, UserIdentity}
import googleAuth.OAuthLoginController
import play.api.mvc.{Action, AnyContent, Request}
import conf.Configuration
import conf.Configuration.environment.projectName
import play.api.libs.ws.WSClient

class OAuthLoginStandaloneController(val wsClient: WSClient) extends OAuthLoginController {
  override def login = Action { request =>
    Ok(views.html.standalone_auth(projectName, "Dev", UserIdentity.fromRequest(request)))
  }
  override def googleAuthConfig(request: Request[AnyContent]): Option[GoogleAuthConfig] = Configuration.standalone.oauthCredentials.map { cred =>
    GoogleAuthConfig(
      cred.oauthClientId,     // The client ID from the dev console
      cred.oauthSecret,       // The client secret from the dev console
      cred.oauthCallback,     // The redirect URL Google send users back to (must be the same as
      // that configured in the developer console)
      Some("guardian.co.uk"), // Google App domain to restrict login
      None
    )
  }
}
