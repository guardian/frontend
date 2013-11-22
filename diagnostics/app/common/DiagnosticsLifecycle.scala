package common

import play.api.GlobalSettings
import model.diagnostics.viewability.LoadJob
import model.diagnostics.javascript.LoadJob
import model.diagnostics.alpha.LoadJob

trait DiagnosticsLifecycle extends GlobalSettings {

  def scheduleJobs() {
    
    Jobs.schedule("DiagnosticsLoadJob", "0/30 * * * * ?") {
      model.diagnostics.alpha.LoadJob.run()
      model.diagnostics.javascript.LoadJob.run()
      model.diagnostics.viewability.LoadJob.run()
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
