import common.Logback.LogstashLifecycle
import common._
import conf.{HealthCheck, CachedHealthCheckLifeCycle}
import conf.switches.SwitchboardLifecycle
import model.ApplicationIdentity
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new DiagnosticsLifecycle(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-diagnostics")),
    LogstashLifecycle,
    new CachedHealthCheckLifeCycle(HealthCheck)
  )
}
