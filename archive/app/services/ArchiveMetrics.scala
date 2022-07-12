package services

import app.LifecycleComponent
import common.JobScheduler
import metrics.CountMetric
import model.diagnostics.CloudWatch
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

object GoogleBotMetric {
  val Googlebot404Count = CountMetric("googlebot-404s", "Googlebot 404s")
}

class ArchiveMetrics(appLifecycle: ApplicationLifecycle, jobs: JobScheduler)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("ArchiveSystemMetricsJob")
    }
  }

  private def report(): Unit = {
    CloudWatch.putMetrics("ArchiveMetrics", List(GoogleBotMetric.Googlebot404Count), List.empty)
  }

  override def start(): Unit = {
    jobs.deschedule("ArchiveSystemMetricsJob")

    jobs.schedule("ArchiveSystemMetricsJob", "0 * * * * ?") {
      report()
    }
  }

}
