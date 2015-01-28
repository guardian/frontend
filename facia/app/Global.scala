import common._
import conf.Filters
import crosswords.TodaysCrosswordGridLifecycle
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters
import services.{IndexListingsLifecycle, ConfigAgentLifecycle}
import play.api.Application

object Global extends WithFilters(Filters.common: _*)
  with ConfigAgentLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with DfpAgentLifecycle
  with SurgingContentAgentLifecycle
  with IndexListingsLifecycle
  with TodaysCrosswordGridLifecycle {
  override lazy val applicationName = "frontend-facia"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    S3Metrics.S3AuthorizationError,
    FaciaMetrics.FaciaToApplicationRedirectMetric,
    FaciaMetrics.FaciaToRssRedirectMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric
  )
}
