import common.{PorterMetrics, Jobs}
import jobs._
import play.api.GlobalSettings

object Global extends GlobalSettings {

  def scheduleJobs() {
    Jobs.schedule("AnalyticsLoadJob", "0 0 7/24 * * ?", PorterMetrics.AnalyticsLoadTimingMetric) {
      AnalyticsLoadJob.run()
    }
    Jobs.schedule("ABTestResultsLoadJob", "0 0 7/24 * * ?", PorterMetrics.AnalyticsLoadTimingMetric) {
      ABTestResultsLoadJob.run()
    }
    Jobs.schedule("FastlyCloudwatchLoadJob", "0 0/2 * * * ?", PorterMetrics.FastlyCloudwatchLoadTimingMetric) {
      FastlyCloudwatchLoadJob.run()
    }
  }

  def descheduleJobs() {
    Jobs.deschedule("AnalyticsLoadJob")
    Jobs.deschedule("ABTestResultsLoadJob")
    Jobs.deschedule("FastlyCloudwatchLoadJob")
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
