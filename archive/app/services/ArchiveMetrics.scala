package services

import common.Jobs
import metrics.CountMetric
import model.diagnostics.CloudWatch
import play.api.{GlobalSettings, Application => PlayApp}

object GoogleBotMetric {
  val Googlebot404Count = CountMetric("googlebot-404s", "Googlebot 404s")
}

trait ArchiveMetrics extends GlobalSettings {

  private def report() {
    CloudWatch.putMetrics("ArchiveMetrics", List(GoogleBotMetric.Googlebot404Count), List.empty)
  }

  override def onStart(app: PlayApp) {
    Jobs.deschedule("ArchiveSystemMetricsJob")
    super.onStart(app)

    Jobs.schedule("ArchiveSystemMetricsJob", "0 * * * * ?"){
      report()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("ArchiveSystemMetricsJob")
    super.onStop(app)
  }

}
