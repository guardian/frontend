import commercial.CommercialLifecycle
import common.Logback.Logstash
import common._
import conf.{CommercialHealthCheckLifeCycle, CorsErrorHandler, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import metrics.MetricUploader

package object CommercialMetrics {

  val metrics = MetricUploader("Commercial")
}

object Global extends CommercialLifecycle
  with DevParametersLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with CorsErrorHandler
  with Logstash
  with CommercialHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-commercial"
}
