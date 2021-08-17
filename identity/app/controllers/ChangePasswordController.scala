package controllers

import common.ImplicitControllerExecutionContext
import model.ApplicationContext
import play.api.http.HttpConfiguration
import play.api.mvc._
import utils.SafeLogging
import conf.Configuration

class ChangePasswordController(
    val controllerComponents: ControllerComponents,
    val httpConfiguration: HttpConfiguration,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging {

  def redirectToResetPassword: Action[AnyContent] =
    Action { implicit request =>
      Redirect(url = s"${Configuration.id.url}/reset", MOVED_PERMANENTLY)
    }
}
