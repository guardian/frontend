import common.Logback.Logstash
import common._
import conf.switches.SwitchboardLifecycle
import conf.{Configuration => GuardianConfiguration}
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
}
