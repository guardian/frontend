import common._
import common.dfp.FaciaDfpAgentLifecycle
import conf.{Filters, SwitchboardLifecycle}
import crosswords.TodaysCrosswordGridLifecycle
import dev.DevParametersLifecycle
import metrics.FrontendMetric
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
  with SwitchboardLifecycle {

override lazy val applicationName = "frontend-facia"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    S3Metrics.S3AuthorizationError,
    FaciaMetrics.FaciaToApplicationRedirectMetric,
    FaciaMetrics.FaciaToRssRedirectMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric
  )
}
