import common.Logback.Logstash
import common._
import common.dfp.FaciaDfpAgentLifecycle
import conf.FaciaHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import crosswords.TodaysCrosswordGridLifecycle
import headlines.ABHeadlinesLifecycle
import ophan.SurgingContentAgentLifecycle
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}

object Global extends ConfigAgentLifecycle
  with CloudWatchApplicationMetrics
  with FaciaDfpAgentLifecycle
  with SurgingContentAgentLifecycle
  with IndexListingsLifecycle
  with TodaysCrosswordGridLifecycle
  with SwitchboardLifecycle
  with ABHeadlinesLifecycle
  with Logstash
  with FaciaHealthCheckLifeCycle {

  override lazy val applicationName = "frontend-facia"
}
