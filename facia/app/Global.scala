import common.Logback.Logstash
import common._
import common.dfp.FaciaDfpAgentLifecycle
import conf.InjectedCachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import controllers.HealthCheck
import crosswords.TodaysCrosswordGridLifecycle
import headlines.ABHeadlinesLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with ConfigAgentLifecycle
  with CloudWatchApplicationMetrics
  with FaciaDfpAgentLifecycle
  with SurgingContentAgentLifecycle
  with IndexListingsLifecycle
  with TodaysCrosswordGridLifecycle
  with SwitchboardLifecycle
  with ABHeadlinesLifecycle
  with Logstash {

  override lazy val applicationName = "frontend-facia"

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}
