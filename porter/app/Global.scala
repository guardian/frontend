import common.{AkkaAsync, CloudWatchApplicationMetrics, Jobs}
import conf.Management
import jobs._
import play.api.GlobalSettings
import services.PorterConfigAgent

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
    Jobs.schedule("AnalyticsSanityCheckJob", "0 0/15 * * * ?") {
      AnalyticsSanityCheckJob.run()
    }
    Jobs.schedule("FrontPressJob", "0/5 * * * * ?") {
      FrontPressJob.run()
    }
    Jobs.schedule("ConfigAgentJob", "0 * * * * ?") {
      PorterConfigAgent.refresh()
    }
  }

  def descheduleJobs() {
    Jobs.deschedule("AnalyticsLoadJob")
    Jobs.deschedule("ABTestResultsLoadJob")
    Jobs.deschedule("FastlyCloudwatchLoadJob")
    Jobs.deschedule("AnalyticsSanityCheckJob")
    Jobs.deschedule("FrontPressJob")
    Jobs.deschedule("ConfigAgentJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()
    PorterConfigAgent.refresh()
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }
}
