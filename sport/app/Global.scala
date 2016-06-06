import common.{CloudWatchMetricsLifecycle, LifecycleComponent, BackwardCompatibleLifecycleComponents}
import common.Logback.LogstashLifecycle
import conf._
import conf.switches.SwitchboardLifecycle
import cricket.conf.CricketLifecycle
import football.controllers.HealthCheck
import model.ApplicationIdentity
import ophan.SurgingContentAgentLifecycle
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import rugby.conf.RugbyLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-sport")),
    new SurgingContentAgentLifecycle(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    new FootballLifecycle(appLifecycle),
    new CricketLifecycle(appLifecycle),
    new RugbyLifecycle(appLifecycle),
    LogstashLifecycle,
    new CachedHealthCheckLifeCycle(HealthCheck)
  )
}
