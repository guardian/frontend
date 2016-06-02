import commercial.CommercialLifecycle
import common.Logback.Logstash
import common._
import conf.switches.SwitchboardLifecycle
import conf.InjectedCachedHealthCheckLifeCycle
import controllers.HealthCheck
import metrics.MetricUploader
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle

import scala.concurrent.ExecutionContext

package object CommercialMetrics {
  val metrics = MetricUploader("Commercial")
}

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with Logstash {
  override lazy val applicationName = "frontend-commercial"

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new CommercialLifecycle(appLifecycle),
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}
