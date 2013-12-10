package controllers.admin

import controllers.AuthLogging
import common.Logging
import play.api.mvc.Controller
import tools.{ChartFormat, CloudWatch}
import ChartFormat._

object FastlyController extends Controller with Logging with AuthLogging {
  def renderFastly() = Authenticated { request =>

    val errors = CloudWatch.fastlyErrors.map(_.withFormat(SingleLineRed))
    val statistics = CloudWatch.fastlyHitMissStatistics.map(_.withFormat(DoubleLineBlueRed))

    Ok(views.html.lineCharts("PROD", errors ++ statistics))
  }
}
