import common.Logback.LogstashLifecycle
import common.dfp.DfpAgentLifecycle
import common._
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import contentapi.SectionsLookUpLifecycle
import controllers.HealthCheck
import jobs.SiteMapLifecycle
import model.ApplicationIdentity
import ophan.SurgingContentAgentLifecycle
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {

  val applicationMetrics = ApplicationMetrics(
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
    new ConfigAgentLifecycle(appLifecycle),
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-applications"), applicationMetrics),
    new DfpAgentLifecycle(appLifecycle),
    new SurgingContentAgentLifecycle(appLifecycle),
    IndexListingsLifecycle,
    new SectionsLookUpLifecycle(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    new SiteMapLifecycle(),
    LogstashLifecycle,
    new CachedHealthCheckLifeCycle(HealthCheck)
  )
}
