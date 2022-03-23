package controllers.admin

import com.gu.googleauth.GoogleAuthConfig
import googleAuth.OAuthLoginController
import model.ApplicationContext
import play.api.http.HttpConfiguration
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, ControllerComponents, Request}

class OAuthLoginAdminController(
    val wsClient: WSClient,
    val httpConfiguration: HttpConfiguration,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends OAuthLoginController {

  override def login: Action[AnyContent] =
    Action { implicit request =>
      val error = request.flash.get("error")
      Ok(views.html.auth.login(error))
    }
  override def googleAuthConfig(request: Request[AnyContent]): Option[GoogleAuthConfig] = {
    val host = Some(s"${if (request.secure) "https" else "http"}://${request.host}")
    conf.GoogleAuth(host, httpConfiguration).config
  }
}
