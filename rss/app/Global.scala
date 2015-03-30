import common.{ContentApiMetrics, CloudWatchApplicationMetrics}
import conf.Filters
import contentapi.SectionsLookUpLifecycle
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle

object Global extends WithFilters(Filters.common: _*)
with ConfigAgentLifecycle
with DevParametersLifecycle
with CloudWatchApplicationMetrics
with DfpAgentLifecycle
with SurgingContentAgentLifecycle
with SectionsLookUpLifecycle {
  override lazy val applicationName = "frontend-rss"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ List(
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ElasticHttpTimingMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric,
    ContentApiMetrics.ContentApiCircuitBreakerOnOpen,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
