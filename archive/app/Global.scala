import common.{CloudWatchMetricsLifecycle, LifecycleComponent, BackwardCompatibleLifecycleComponents}
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import controllers.HealthCheck
import model.ApplicationIdentity
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import services.ArchiveMetrics

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-archive")),
    new ArchiveMetrics(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    LogstashLifecycle,
    new CachedHealthCheckLifeCycle(HealthCheck)
  )
}
