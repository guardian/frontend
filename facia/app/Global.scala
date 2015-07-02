import ab_headlines.ABTHeadlinesLifecycle
import common._
import conf.Filters
import crosswords.TodaysCrosswordGridLifecycle
import dev.DevParametersLifecycle
import dfp.FaciaDfpAgentLifecycle
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
  with ABTHeadlinesLifecycle
  with TodaysCrosswordGridLifecycle {
  override lazy val applicationName = "frontend-facia"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    S3Metrics.S3AuthorizationError,
    FaciaMetrics.FaciaToApplicationRedirectMetric,
    FaciaMetrics.FaciaToRssRedirectMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric
  )
}
