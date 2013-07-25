package controllers.metrics

import play.api.mvc.Controller
import controllers.{AuthAction, AuthLogging}
import common.Logging
import tools.CloudWatch


object DashboardController extends Controller with Logging with AuthLogging {
  def render() = AuthAction{ request =>
      // thats right, we only do PROD metrcs
      Ok(views.html.dashboard("PROD", CloudWatch.latency ++ CloudWatch.requestOkCount))
  }
}
