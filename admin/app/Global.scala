import common.{CloudWatchMetricsLifecycle, BackwardCompatibleLifecycleComponents, LifecycleComponent}
import common.Logback.LogstashLifecycle
import common.dfp.DfpAgentLifecycle
import conf.CachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import controllers.HealthCheck
import dfp.DfpDataCacheLifecycle
import model.{ApplicationIdentity, AdminLifecycle}
import ophan.SurgingContentAgentLifecycle
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import services.ConfigAgentLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new AdminLifecycle(appLifecycle),
    new ConfigAgentLifecycle(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-admin")),
    new SurgingContentAgentLifecycle(appLifecycle),
    new DfpAgentLifecycle(appLifecycle),
    new DfpDataCacheLifecycle(appLifecycle),
    LogstashLifecycle,
    new CachedHealthCheckLifeCycle(HealthCheck)
  )
}
