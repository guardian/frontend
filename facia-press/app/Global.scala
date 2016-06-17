import common.Logback.LogstashLifecycle
import common._
import conf.switches.SwitchboardLifecycle
import lifecycle.FaciaPressLifecycle
import model.ApplicationIdentity
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import services.ConfigAgentLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {

  val applicationMetrics = ApplicationMetrics(
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
    new ConfigAgentLifecycle(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-facia-press"), applicationMetrics),
    LogstashLifecycle,
    new FaciaPressLifecycle(appLifecycle)
  )
}
