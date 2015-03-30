import common.{CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.{Configuration, Filters}
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters

object Global
  extends WithFilters(Filters.common: _*)
  with DevParametersLifecycle
  with DfpAgentLifecycle
  with CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-article"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    ContentApiMetrics.ElasticHttpTimingMetric,
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric,
    ContentApiMetrics.ContentApiCircuitBreakerOnOpen,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
