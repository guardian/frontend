package controllers.metrics

import controllers.{ Authenticated, AuthLogging }
import common.Logging
import play.api.mvc.Controller
import tools.CloudWatch

object FastlyController extends Controller with Logging with AuthLogging {
  def renderFastly() = Authenticated { request =>
    Ok(views.html.fastly("PROD", CloudWatch.fastlyStatistics, CloudWatch.fastlyHitMissStatistics))
  }
}
