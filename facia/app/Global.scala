import common.Logback.LogstashLifecycle
import common._
import common.dfp.FaciaDfpAgentLifecycle
import conf.CachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import controllers.HealthCheck
import crosswords.TodaysCrosswordGridLifecycle
import headlines.ABHeadlinesLifecycle
import model.ApplicationIdentity
import ophan.SurgingContentAgentLifecycle
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new ConfigAgentLifecycle(appLifecycle),
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-facia")),
    new FaciaDfpAgentLifecycle(appLifecycle),
    new SurgingContentAgentLifecycle(appLifecycle),
    IndexListingsLifecycle,
    new TodaysCrosswordGridLifecycle(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    new ABHeadlinesLifecycle(appLifecycle),
    LogstashLifecycle,
    new CachedHealthCheckLifeCycle(HealthCheck)
  )
}
