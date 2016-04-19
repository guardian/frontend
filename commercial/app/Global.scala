import commercial.CommercialLifecycle
import common.Logback.Logstash
import common._
import conf.{CorsErrorHandler, Filters, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import metrics.MetricUploader
import play.api.mvc.WithFilters

package object CommercialMetrics {

  val metrics = MetricUploader("Commercial")
}

object Global extends WithFilters(Filters.common: _*)
  with CommercialLifecycle
  with DevParametersLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with CorsErrorHandler
  with Logstash {
  override lazy val applicationName = "frontend-commercial"
}
