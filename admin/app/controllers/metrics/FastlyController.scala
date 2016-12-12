package controllers.admin

import common.{ExecutionContexts, Logging}
import model.ApplicationContext
import play.api.mvc.Controller
import play.api.mvc.Action
import tools.CloudWatch

class FastlyController (implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {
  import context._
  def renderFastly() = Action.async { implicit request =>
    for {
      errors <- CloudWatch.fastlyErrors
      statistics <- CloudWatch.fastlyHitMissStatistics
    } yield Ok(views.html.lineCharts(errors ++ statistics))
  }
}
