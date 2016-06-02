package common

import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class DiagnosticsLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent with Logging {

  appLifecycle.addStopHook { () => Future {
    descheduleJobs()
  }}

  private def scheduleJobs() {
    Jobs.schedule("DiagnosticsLoadJob", "0 * * * * ?") {
      model.diagnostics.analytics.UploadJob.run()
    }
  }

  private def descheduleJobs() {
    Jobs.deschedule("DiagnosticsLoadJob")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()
  }
}
