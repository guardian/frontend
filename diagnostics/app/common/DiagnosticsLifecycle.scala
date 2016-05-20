package common

import play.api.GlobalSettings

trait DiagnosticsLifecycle extends GlobalSettings with Logging {

  private def scheduleJobs() {
    Jobs.schedule("DiagnosticsLoadJob", "0 * * * * ?") {
      model.diagnostics.analytics.UploadJob.run()
    }
  }

  private def descheduleJobs() {
    Jobs.deschedule("DiagnosticsLoadJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }
}
