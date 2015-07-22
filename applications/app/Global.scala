import ab_headlines.ABTHeadlinesLifecycle
import common.dfp.DfpAgentLifecycle
import common.{CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.{CorsErrorHandler, Filters, SwitchboardLifecycle}
import contentapi.SectionsLookUpLifecycle
import dev.DevParametersLifecycle
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
  with IndexListingsLifecycle
  with SectionsLookUpLifecycle
  with ABTHeadlinesLifecycle
  with SwitchboardLifecycle
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-applications"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ List(
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ElasticHttpTimingMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric,
    ContentApiMetrics.ContentApiCircuitBreakerOnOpen,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
