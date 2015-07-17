import ab_headlines.ABTHeadlinesLifecycle
import common._
import conf.{SwitchboardLifecycle, Filters}
import crosswords.TodaysCrosswordGridLifecycle
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters
import services.{IndexListingsLifecycle, ConfigAgentLifecycle}

object Global extends WithFilters(Filters.common: _*)
  with ConfigAgentLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with DfpAgentLifecycle
  with SurgingContentAgentLifecycle
  with IndexListingsLifecycle
  with ABTHeadlinesLifecycle
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
