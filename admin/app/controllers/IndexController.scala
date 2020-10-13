package controllers.admin

import com.gu.googleauth.AuthAction
import play.api.mvc._
import model.{ApplicationContext, NoCache}
import play.components.HttpConfigurationComponents

trait AdminAuthController extends HttpConfigurationComponents {

  def controllerComponents: ControllerComponents

  object AdminAuthAction
      extends AuthAction(
        conf.GoogleAuth(httpConfiguration).getConfigOrDie,
        routes.OAuthLoginAdminController.login(),
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
