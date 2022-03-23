package controllers

import com.gu.googleauth.{AntiForgeryChecker, GoogleAuthConfig, UserIdentity}
import conf.Configuration
import googleAuth.OAuthLoginController
import model.ApplicationContext
import play.api.http.HttpConfiguration
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, ControllerComponents, Request}

class OAuthLoginPreviewController(
    val wsClient: WSClient,
    val httpConfiguration: HttpConfiguration,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends OAuthLoginController {

  override def login: Action[AnyContent] =
    Action { request =>
      Ok(views.html.previewAuth(context.applicationIdentity.name, "Dev", UserIdentity.fromRequest(request)))
    }
  override def googleAuthConfig(request: Request[AnyContent]): Option[GoogleAuthConfig] = {
    conf
      .GoogleAuth(
        None,
        httpConfiguration,
        Configuration.standalone.oauthCredentials,
      )
      .config
  }
}
