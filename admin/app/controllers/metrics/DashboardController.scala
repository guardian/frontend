package controllers.admin

import common.Logging
import controllers.AuthLogging
import play.api.mvc.Controller
import tools._
import model.NoCache
import conf.Configuration

object DashboardController extends Controller with Logging with AuthLogging {
  // We only do PROD metrics

  val stage = Configuration.environment.stage.toUpperCase

  def renderDashboard() = Authenticated { request =>
    val latency = CloudWatch.fullStackLatency.map(_.withFormat(ChartFormat.SingleLineGreen))
    val charts = (latency ++ CloudWatch.requestOkFullStack).groupBy(_.name).flatMap(_._2).toSeq
    NoCache(Ok(views.html.lineCharts("PROD", charts)))
  }

  def renderErrors() = Authenticated { request =>
    NoCache(Ok(views.html.lineCharts("PROD", Seq(HttpErrors.global4XX, HttpErrors.global5XX.withFormat(ChartFormat.SingleLineRed)))))
  }

  def render4XX() = Authenticated { request =>
    NoCache(Ok(views.html.lineCharts("PROD", HttpErrors.notFound)))
  }

  def render5XX() = Authenticated { request =>
    NoCache(Ok(views.html.lineCharts("PROD", HttpErrors.errors.map(_.withFormat(ChartFormat.SingleLineRed)))))
  }

  def renderMemory() = Authenticated{ request =>
    val metrics = MemoryMetrics.memory.map(_.withFormat(ChartFormat.DoubleLineBlueRed))
    NoCache(Ok(views.html.lineCharts(stage, metrics)))
  }
}
