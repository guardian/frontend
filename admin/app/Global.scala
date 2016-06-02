import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents, CloudWatchApplicationMetrics}
import common.Logback.Logstash
import common.dfp.DfpAgentLifecycle
import conf.InjectedCachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import controllers.HealthCheck
import dfp.DfpDataCacheLifecycle
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle
import services.ConfigAgentLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with ConfigAgentLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with DfpAgentLifecycle
  with Logstash {

  override lazy val applicationName = "frontend-admin"

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new AdminLifecycle(appLifecycle),
    new DfpDataCacheLifecycle(appLifecycle),
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}
