import business.StocksDataLifecycle
import common.Logback.Logstash
import common.{CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.switches.SwitchboardLifecycle
import conf.OnwardHealthCheckLifeCycle
import feed.{MostPopularFacebookAutoRefreshLifecycle, MostReadLifecycle, OnwardJourneyLifecycle}
import metrics.FrontendMetric

object Global extends OnwardJourneyLifecycle
  with CloudWatchApplicationMetrics
  with MostReadLifecycle
  with StocksDataLifecycle
  with MostPopularFacebookAutoRefreshLifecycle
  with SwitchboardLifecycle
  with Logstash
  with OnwardHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-onward"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ Seq(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
