import common.Logback.Logstash
import common._
import conf.{Configuration => GuardianConfiguration, SwitchboardLifecycle}
import frontpress.{FrontPressCron, ToolPressQueueWorker}
import play.api.GlobalSettings
import services.ConfigAgentLifecycle

object Global extends GlobalSettings
  with ConfigAgentLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with Logstash {

  override def applicationName = "frontend-facia-press"

  override def applicationMetrics = List(
    FaciaPressMetrics.FrontPressCronSuccess,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApi404Metric,
    ContentApiMetrics.ContentApiErrorMetric,
    FaciaPressMetrics.UkPressLatencyMetric,
    FaciaPressMetrics.UsPressLatencyMetric,
    FaciaPressMetrics.AuPressLatencyMetric,
    FaciaPressMetrics.AllFrontsPressLatencyMetric
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
