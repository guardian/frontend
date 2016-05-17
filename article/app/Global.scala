import common.Logback.Logstash
import common.dfp.DfpAgentLifecycle
import common.{CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.{ArticleHealthCheckLifeCycle, CorsErrorHandler, Filters, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters
import services.NewspaperBooksAndSectionsAutoRefresh

object Global
  extends WithFilters(Filters.common: _*)
  with NewspaperBooksAndSectionsAutoRefresh
  with DevParametersLifecycle
  with DfpAgentLifecycle
  with CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with CorsErrorHandler
  with SwitchboardLifecycle
  with Logstash
  with ArticleHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-article"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
