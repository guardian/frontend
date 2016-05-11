import business.StocksDataLifecycle
import common.Logback.Logstash
import common.{ApplicationMode, CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.{CorsErrorHandler, Filters, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import feed.{MostPopularFacebookAutoRefreshLifecycle, MostReadLifecycle, OnwardJourneyLifecycle}
import metrics.FrontendMetric
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
  with ApplicationMode
  with OnwardJourneyLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with MostReadLifecycle
  with StocksDataLifecycle
  with MostPopularFacebookAutoRefreshLifecycle
  with SwitchboardLifecycle
  with CorsErrorHandler
  with Logstash {
  override lazy val applicationName = "frontend-onward"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ Seq(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
