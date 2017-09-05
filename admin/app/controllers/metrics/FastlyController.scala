package controllers.admin

import common.{ImplicitControllerExecutionContext, Logging}
import model.ApplicationContext
import play.api.mvc.{BaseController, ControllerComponents}
import tools.CloudWatch

class FastlyController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with Logging with ImplicitControllerExecutionContext {
    def renderFastly() = Action.async { implicit request =>
    for {
      errors <- CloudWatch.fastlyErrors()
      statistics <- CloudWatch.fastlyHitMissStatistics()
    } yield Ok(views.html.lineCharts(errors ++ statistics))
  }
}
