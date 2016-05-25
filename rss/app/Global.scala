import common.Logback.Logstash
import common.{CloudWatchApplicationMetrics, ContentApiMetrics}
import conf._
import contentapi.SectionsLookUpLifecycle
import dev.DevParametersLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import services.ConfigAgentLifecycle

object Global extends ConfigAgentLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with SectionsLookUpLifecycle
  with SwitchboardLifecycle
  with Logstash
  with RssHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-rss"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ List(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
