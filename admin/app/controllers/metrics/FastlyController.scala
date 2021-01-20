package controllers.admin

import common.{ImplicitControllerExecutionContext, GuLogging}
import model.ApplicationContext
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import tools.CloudWatch

class FastlyController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {
  def renderFastly(): Action[AnyContent] =
    Action.async { implicit request =>
      for {
        errors <- CloudWatch.fastlyErrors()
        statistics <- CloudWatch.fastlyHitMissStatistics()
      } yield Ok(views.html.lineCharts(errors ++ statistics))
    }
}
