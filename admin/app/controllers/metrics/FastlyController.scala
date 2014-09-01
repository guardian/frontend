package controllers.admin

import controllers.AuthLogging
import common.Logging
import play.api.mvc.Controller
import tools.CloudWatch

object FastlyController extends Controller with Logging with AuthLogging {
  def renderFastly() =AuthActions.AuthActionTest { request =>

    val errors = CloudWatch.fastlyErrors
    val statistics = CloudWatch.fastlyHitMissStatistics

    Ok(views.html.lineCharts("PROD", errors ++ statistics))
  }
}
