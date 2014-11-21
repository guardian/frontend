import common.{ContentApiMetrics, CloudWatchApplicationMetrics}
import conf.Filters
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}

object Global extends WithFilters(Filters.common: _*)
  with ConfigAgentLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with DfpAgentLifecycle
  with SurgingContentAgentLifecycle
  with IndexListingsLifecycle {
  override lazy val applicationName = "frontend-applications"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ List(
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric,
    ContentApiMetrics.ContentApiCircuitBreakerOnOpen
  )
}
