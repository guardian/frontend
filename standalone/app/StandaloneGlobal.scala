import commercial.CommercialLifecycle
import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents}
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import conf._
import conf.switches.SwitchboardLifecycle
import cricket.conf.CricketLifecycle
import feed.OnwardJourneyLifecycle
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import rugby.conf.RugbyLifecycle
import services.ConfigAgentLifecycle

import scala.concurrent.ExecutionContext

class StandaloneGlobal extends GlobalSettings with BackwardCompatibleLifecycleComponents {
  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new CommercialLifecycle(appLifecycle),
    new OnwardJourneyLifecycle(appLifecycle),
    new ConfigAgentLifecycle(appLifecycle),
    new FaciaDfpAgentLifecycle(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    new FootballLifecycle(appLifecycle),
    new CricketLifecycle(appLifecycle),
    new RugbyLifecycle(appLifecycle),
    LogstashLifecycle
  )
}
