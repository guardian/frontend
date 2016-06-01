import common.Logback.Logstash
import common.dfp.DfpAgentLifecycle
import common._
import conf.InjectedCachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import contentapi.SectionsLookUpLifecycle
import controllers.HealthCheck
import jobs.SiteMapLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with ConfigAgentLifecycle
  with CloudWatchApplicationMetrics
  with DfpAgentLifecycle
  with SurgingContentAgentLifecycle
  with IndexListingsLifecycle
  with SectionsLookUpLifecycle
  with SwitchboardLifecycle
  with Logstash {
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

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new SiteMapLifecycle(),
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}
