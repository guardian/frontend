import common.CloudWatchApplicationMetrics
import conf.{SwitchboardLifecycle, PngResizerMetrics, Filters}
import metrics.FrontendMetric
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
  with CloudWatchApplicationMetrics
  with SwitchboardLifecycle {
  override def applicationName: String = "png-resizer"

  override def applicationMetrics: List[FrontendMetric] = PngResizerMetrics.all
}
