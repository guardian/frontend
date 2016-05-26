import commercial.CommercialLifecycle
import common.Logback.Logstash
import common._
import conf.switches.SwitchboardLifecycle
import conf.CommercialHealthCheckLifeCycle
import metrics.MetricUploader

package object CommercialMetrics {

  val metrics = MetricUploader("Commercial")
}

object Global extends CommercialLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with Logstash
  with CommercialHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-commercial"
}
