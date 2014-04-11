package services

import common.{SimpleCountMetric, Jobs}
import model.diagnostics.CloudWatch
import play.api.{Application => PlayApp, GlobalSettings}

trait ArchiveMetrics extends GlobalSettings {

  private def report() {
    CloudWatch.put("ArchiveMetrics", Map(
      Googlebot404Count.name -> Googlebot404Count.getAndReset
    ))
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

object Googlebot404Count extends SimpleCountMetric("archive", "googlebot-404s", "Googlebot 404s", "Googlebot 404s")
