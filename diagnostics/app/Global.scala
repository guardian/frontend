
import common.{PorterMetrics, Jobs}
import play.api.GlobalSettings
import model.diagnostics._

object Global extends GlobalSettings {

  def scheduleJobs() {
    Jobs.schedule("DiagnosticsLoadJob", "0 * * * * ?", PorterMetrics.AnalyticsLoadTimingMetric) {
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
