import common.Logback.Logstash
import common.dfp.DfpAgentLifecycle
import common.{CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.{ArticleHealthCheckLifeCycle, CorsErrorHandler, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import services.NewspaperBooksAndSectionsAutoRefresh

object Global
  extends NewspaperBooksAndSectionsAutoRefresh
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
