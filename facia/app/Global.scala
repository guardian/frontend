import common.Logback.Logstash
import common._
import common.dfp.FaciaDfpAgentLifecycle
import conf.{FaciaHealthCheckLifeCycle, Filters, SwitchboardLifecycle}
import crosswords.TodaysCrosswordGridLifecycle
import dev.DevParametersLifecycle
import headlines.ABHeadlinesLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}

object Global extends WithFilters(Filters.common: _*)
  with ConfigAgentLifecycle
  with DevParametersLifecycle
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
