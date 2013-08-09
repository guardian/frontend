import common.{ PorterMetrics, Jobs }
import jobs._
import play.api.GlobalSettings

object Global extends GlobalSettings  {
  override def onStart(app: play.api.Application) {
    super.onStart(app)

    Jobs.schedule("AnalyticsLoadJob", "0 0 8/24 * * ?", PorterMetrics.AnalyticsLoadTimingMetric) {
      AnalyticsLoadJob.run()
    }
    Jobs.schedule("FastlyCloudwatchLoadJob", "0 0/2 * * * ?", PorterMetrics.FastlyCloudwatchLoadTimingMetric) {
      FastlyCloudwatchLoadJob.run()
    }
  }

  override def onStop(app: play.api.Application) {
    Jobs.deschedule("AnalyticsLoadJob")
    Jobs.deschedule("FastlyCloudwatchLoadJob")

    super.onStop(app)
  }
}
