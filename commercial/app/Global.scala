import commercial.CommercialLifecycle
import common.Logback.LogstashLifecycle
import common._
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import controllers.HealthCheck
import metrics.MetricUploader
import model.ApplicationIdentity
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle

import scala.concurrent.ExecutionContext

package object CommercialMetrics {
  val metrics = MetricUploader("Commercial")
}

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new CommercialLifecycle(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-commercial")),
    LogstashLifecycle,
    new CachedHealthCheckLifeCycle(HealthCheck)
  )
}
