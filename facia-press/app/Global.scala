import common._
import conf.{Configuration => GuardianConfiguration, SwitchboardLifecycle}
import frontpress.{FrontPressCron, ToolPressQueueWorker}
import metrics._
import play.api.GlobalSettings
import services.ConfigAgentLifecycle

object Global extends GlobalSettings
  with ConfigAgentLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics {

  override def applicationName = "frontend-facia-press"

  override def applicationMetrics = List(
    FaciaPressMetrics.FrontPressCronSuccess,
    ContentApiMetrics.ElasticHttpTimingMetric,
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ContentApi404Metric,
    ContentApiMetrics.ContentApiErrorMetric,
    UkPressLatencyMetric,
    UsPressLatencyMetric,
    AuPressLatencyMetric,
    AllFrontsPressLatencyMetric
  )

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    ToolPressQueueWorker.start()
    if (GuardianConfiguration.faciatool.frontPressCronQueue.isDefined) {
      FrontPressCron.start()
    }
  }

  override def onStop(app: play.api.Application) {
    ToolPressQueueWorker.stop()
    super.onStop(app)
  }
}
