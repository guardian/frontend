import common.Logback.Logstash
import common.dfp.DfpAgentLifecycle
import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents, CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.switches.SwitchboardLifecycle
import conf.InjectedCachedHealthCheckLifeCycle
import controllers.HealthCheck
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import services.NewspaperBooksAndSectionsAutoRefresh

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with DfpAgentLifecycle
  with CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with SwitchboardLifecycle
  with Logstash {

  override lazy val applicationName = "frontend-article"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    NewspaperBooksAndSectionsAutoRefresh,
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}
