import common.Logback.Logstash
import common.{CloudWatchApplicationMetrics, LifecycleComponent, BackwardCompatibleLifecycleComponents}
import conf.switches.SwitchboardLifecycle
import conf.InjectedCachedHealthCheckLifeCycle
import controllers.HealthCheck
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import services.ArchiveMetrics

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with CloudWatchApplicationMetrics
  with SwitchboardLifecycle
  with Logstash {

  override lazy val applicationName = "frontend-archive"

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new ArchiveMetrics(appLifecycle),
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}
