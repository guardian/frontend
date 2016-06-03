import common.Logback.Logstash
import common._
import conf.switches.SwitchboardLifecycle
import lifecycle.FaciaPressLifecycle
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle
import services.ConfigAgentLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
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

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new FaciaPressLifecycle(appLifecycle)
  )
}
