import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents, CloudWatchApplicationMetrics}
import common.Logback.Logstash
import conf._
import conf.switches.SwitchboardLifecycle
import cricket.conf.CricketLifecycle
import football.controllers.HealthCheck
import ophan.SurgingContentAgentLifecycle
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle
import rugby.conf.RugbyLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with SwitchboardLifecycle
  with Logstash {
  override lazy val applicationName = "frontend-sport"

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new FootballLifecycle(appLifecycle),
    new CricketLifecycle(appLifecycle),
    new RugbyLifecycle(appLifecycle),
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}
