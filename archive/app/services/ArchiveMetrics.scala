package services

import common.{LifecycleComponent, Jobs}
import metrics.CountMetric
import model.diagnostics.CloudWatch
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

object GoogleBotMetric {
  val Googlebot404Count = CountMetric("googlebot-404s", "Googlebot 404s")
}

class ArchiveMetrics(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook{ () => Future{
    Jobs.deschedule("ArchiveSystemMetricsJob")
  }}

  private def report() {
    CloudWatch.putMetrics("ArchiveMetrics", List(GoogleBotMetric.Googlebot404Count), List.empty)
  }

  override def start():Unit = {
    Jobs.deschedule("ArchiveSystemMetricsJob")

    Jobs.schedule("ArchiveSystemMetricsJob", "0 * * * * ?"){
      report()
    }
  }

}
