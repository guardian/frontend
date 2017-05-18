package controllers.admin

import common.{ExecutionContexts, Logging}
import model.ApplicationContext
import play.api.mvc.{Action, AnyContent, Controller}
import tools.CloudWatch

class FastlyController (implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {
    def renderFastly(): Action[AnyContent] = Action.async { implicit request =>
    for {
      errors <- CloudWatch.fastlyErrors
      statistics <- CloudWatch.fastlyHitMissStatistics
    } yield Ok(views.html.lineCharts(errors ++ statistics))
  }
}
