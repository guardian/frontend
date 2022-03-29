package controllers.admin

import com.gu.googleauth.AuthAction
import conf.AdminConfiguration
import model.{ApplicationContext, NoCache}
import play.api.http.HttpConfiguration
import play.api.mvc._

trait AdminAuthController {

  def controllerComponents: ControllerComponents

  case class AdminAuthAction(httpConfiguration: HttpConfiguration)
      extends AuthAction(
        conf
          .GoogleAuth(None, httpConfiguration, AdminConfiguration.oauthCredentialsWithSingleCallBack(None))
          .getConfigOrDie,
        routes.OAuthLoginAdminController.login,
        controllerComponents.parsers.default,
      )(controllerComponents.executionContext)
}

class AdminIndexController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController {

  def index(): Action[AnyContent] = Action { Redirect("/admin") }

  def admin(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.admin()))
    }
}
