import common.{ContentApiMetrics, CloudWatchApplicationMetrics}
import conf.{Configuration, Filters}
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import feed.{MostReadLifecycle, OnwardJourneyLifecycle}
import metrics.FrontendMetric
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
  with OnwardJourneyLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with DfpAgentLifecycle
  with MostReadLifecycle
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-onward"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ Seq(
    ContentApiMetrics.ContentApiCircuitBreakerOnOpen,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric,
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
