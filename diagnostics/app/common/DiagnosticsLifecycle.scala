package common

import play.api.GlobalSettings
import model.diagnostics.DiagnosticsLoadJob

trait DiagnosticsLifecycle extends GlobalSettings {

  def scheduleJobs() {
    Jobs.schedule("DiagnosticsLoadJob", "0 * * * * ?") {
      DiagnosticsLoadJob.run()
    }
  }

  def descheduleJobs() {
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
