import common.Logback.Logstash
import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents, CloudWatchApplicationMetrics, DiagnosticsLifecycle}
import conf.InjectedCachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import controllers.HealthCheck
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with Logstash {
  override lazy val applicationName = "frontend-diagnostics"

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new DiagnosticsLifecycle(appLifecycle),
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}
