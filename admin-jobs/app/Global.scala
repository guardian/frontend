import common.{CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.{Filters, SwitchboardLifecycle}
import contentapi.SectionsLookUpLifecycle
import dev.DevParametersLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle

object Global extends WithFilters(Filters.common: _*)
with ConfigAgentLifecycle
with DevParametersLifecycle
with CloudWatchApplicationMetrics
with SurgingContentAgentLifecycle
with SectionsLookUpLifecycle
with SwitchboardLifecycle {
  override lazy val applicationName = "frontend-admin-jobs"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ List(
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ElasticHttpTimingMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric,
    ContentApiMetrics.ContentApiCircuitBreakerOnOpen,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
