package controllers.metrics

import play.api.mvc.Controller
import controllers.{AuthAction, AuthLogging}
import common.Logging
import tools.CloudWatch

object FastlyController extends Controller with Logging with AuthLogging {
  def render() = AuthAction{ request =>
      Ok(views.html.fastly("PROD", CloudWatch.fastlyStatistics, CloudWatch.fastlyHitMissStatistics))
  }
}
