import common.Logback.Logstash
import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents, CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.InjectedCachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import contentapi.SectionsLookUpLifecycle
import controllers.HealthCheck
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import services.ConfigAgentLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
with ConfigAgentLifecycle
with CloudWatchApplicationMetrics
with SurgingContentAgentLifecycle
with SectionsLookUpLifecycle
with SwitchboardLifecycle
with Logstash {
  override lazy val applicationName = "frontend-admin-jobs"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ List(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}
