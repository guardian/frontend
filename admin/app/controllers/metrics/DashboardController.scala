package controllers.metrics

import common.Logging
import controllers.{ Authenticated, AuthLogging }
import play.api.mvc.Controller
import tools.CloudWatch

object DashboardController extends Controller with Logging with AuthLogging {
  // We only do PROD metrics

  def renderDashboard() = Authenticated { request =>
    Ok(views.html.dashboard("PROD", CloudWatch.latency ++ CloudWatch.requestOkCount))
  }
}
