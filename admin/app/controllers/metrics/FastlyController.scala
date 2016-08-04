package controllers.admin

import controllers.AuthLogging
import common.{ExecutionContexts, Logging}
import play.api.mvc.Controller
import play.api.mvc.Action
import tools.CloudWatch

class FastlyController extends Controller with Logging with AuthLogging with ExecutionContexts {
  def renderFastly() = Action.async { implicit request =>
    for {
      errors <- CloudWatch.fastlyErrors
      statistics <- CloudWatch.fastlyHitMissStatistics
    } yield Ok(views.html.lineCharts("PROD", errors ++ statistics))
  }
}
