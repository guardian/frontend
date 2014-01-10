package common

import play.api.GlobalSettings

trait DiagnosticsLifecycle extends GlobalSettings {

  def scheduleJobs() {
    
    Jobs.schedule("DiagnosticsLoadJob", "0 * * * * ?") {
      model.diagnostics.alpha.LoadJob.run()
      model.diagnostics.javascript.LoadJob.run()
      model.diagnostics.viewability.LoadJob.run()
      model.diagnostics.abtests.UploadJob.run()
      model.diagnostics.viewability.CountUploadJob.run()
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
