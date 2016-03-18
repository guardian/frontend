import common.{CloudWatchApplicationMetrics, ContentApiMetrics}
import common.Logback.Logstash
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
  with SwitchboardLifecycle
  with Logstash {
  override lazy val applicationName = "frontend-rss"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ List(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )
}
