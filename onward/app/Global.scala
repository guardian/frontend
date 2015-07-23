import business.StocksDataLifecycle
import common.{CloudWatchApplicationMetrics, ContentApiMetrics, WeatherMetrics}
import conf.{CorsErrorHandler, Filters, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import feed.{MostPopularFacebookAutoRefreshLifecycle, MostReadLifecycle, OnwardJourneyLifecycle}
import metrics.FrontendMetric
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
  with OnwardJourneyLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with MostReadLifecycle
  with StocksDataLifecycle
  with MostPopularFacebookAutoRefreshLifecycle
  with SwitchboardLifecycle
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-onward"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ Seq(
    ContentApiMetrics.ContentApiCircuitBreakerOnOpen,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric,
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    WeatherMetrics.whatIsMyCityRequests
  )
}


