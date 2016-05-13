import business.StocksDataLifecycle
import common.Logback.Logstash
import common.{CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.{CorsErrorHandler, OnwardHealthCheckLifeCycle, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import feed.{MostPopularFacebookAutoRefreshLifecycle, MostReadLifecycle, OnwardJourneyLifecycle}
import metrics.FrontendMetric

object Global extends OnwardJourneyLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with MostReadLifecycle
  with StocksDataLifecycle
  with MostPopularFacebookAutoRefreshLifecycle
  with SwitchboardLifecycle
  with CorsErrorHandler
  with Logstash
  with OnwardHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-onward"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ Seq(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
