import common.Logback.Logstash
import common.dfp.DfpAgentLifecycle
import common.{CloudWatchApplicationMetrics, ContentApiMetrics, EmailSubsciptionMetrics}
import conf.switches.SwitchboardLifecycle
import conf.ApplicationsHealthCheckLifeCycle
import contentapi.SectionsLookUpLifecycle
import jobs.SiteMapLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}

object Global extends ConfigAgentLifecycle
  with CloudWatchApplicationMetrics
  with DfpAgentLifecycle
  with SurgingContentAgentLifecycle
  with IndexListingsLifecycle
  with SectionsLookUpLifecycle
  with SwitchboardLifecycle
  with SiteMapLifecycle
  with Logstash
  with ApplicationsHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-applications"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ List(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    EmailSubsciptionMetrics.EmailSubmission,
    EmailSubsciptionMetrics.EmailFormError,
    EmailSubsciptionMetrics.NotAccepted,
    EmailSubsciptionMetrics.APIHTTPError,
    EmailSubsciptionMetrics.APINetworkError,
    EmailSubsciptionMetrics.ListIDError,
    EmailSubsciptionMetrics.AllEmailSubmission
  )
}
