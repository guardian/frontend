import business.StocksDataLifecycle
import common.Logback.Logstash
import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents, CloudWatchApplicationMetrics, ContentApiMetrics}
import conf.switches.SwitchboardLifecycle
import conf.InjectedCachedHealthCheckLifeCycle
import controllers.HealthCheck
import feed.{MostPopularFacebookAutoRefreshLifecycle, MostReadLifecycle, OnwardJourneyLifecycle}
import metrics.FrontendMetric
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with CloudWatchApplicationMetrics
  with SwitchboardLifecycle
  with Logstash {
  override lazy val applicationName = "frontend-onward"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ Seq(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new InjectedCachedHealthCheckLifeCycle(HealthCheck),
    new OnwardJourneyLifecycle(appLifecycle),
    new MostReadLifecycle(appLifecycle),
    new StocksDataLifecycle(appLifecycle),
    new MostPopularFacebookAutoRefreshLifecycle(appLifecycle)
  )
}
