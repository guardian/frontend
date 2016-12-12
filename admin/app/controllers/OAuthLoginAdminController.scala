package controllers.admin

import com.gu.googleauth.GoogleAuthConfig
import googleAuth.OAuthLoginController
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, Request}

class OAuthLoginAdminController(val wsClient: WSClient)(implicit context: ApplicationContext) extends OAuthLoginController {
  import context._
  override def login = Action { implicit request =>
    val error = request.flash.get("error")
    Ok(views.html.auth.login(error))
  }
  override def googleAuthConfig(request: Request[AnyContent]): Option[GoogleAuthConfig] = {
    val host = Some(s"${if (request.secure) "https" else "http"}://${request.host}")
    conf.GoogleAuth(host).config
  }
}
