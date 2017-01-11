package controllers

import com.gu.googleauth.{GoogleAuthConfig, UserIdentity}
import conf.Configuration
import googleAuth.OAuthLoginController
import model.ApplicationContext
import play.api.libs.crypto.CryptoConfig
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, Request}

class OAuthLoginPreviewController(val wsClient: WSClient, val cryptoConfig: CryptoConfig)(implicit context: ApplicationContext) extends OAuthLoginController {

  override def login = Action { request =>
    Ok(views.html.previewAuth(context.applicationIdentity.name, "Dev", UserIdentity.fromRequest(request)))
  }
  override def googleAuthConfig(request: Request[AnyContent]): Option[GoogleAuthConfig] = Configuration.standalone.oauthCredentials.map { cred =>
    GoogleAuthConfig(
      cred.oauthClientId,     // The client ID from the dev console
      cred.oauthSecret,       // The client secret from the dev console
      cred.oauthCallback,     // The redirect URL Google send users back to (must be the same as
      // that configured in the developer console)
      "guardian.co.uk", // Google App domain to restrict login
      None
    )
  }
}
