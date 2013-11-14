import common.{CloudWatchApplicationMetrics, Jobs}
import conf.Management
import jobs._
import play.api.GlobalSettings

object Global extends GlobalSettings with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName

  def scheduleJobs() {
    Jobs.schedule("AnalyticsLoadJob", "0 0 7/24 * * ?") {
      AnalyticsLoadJob.run()
    }
    Jobs.schedule("ABTestResultsLoadJob", "0 0 7/24 * * ?") {
      ABTestResultsLoadJob.run()
    }
    Jobs.schedule("FastlyCloudwatchLoadJob", "0 0/2 * * * ?") {
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
