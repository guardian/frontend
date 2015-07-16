import common.CloudWatchApplicationMetrics
import conf.{PngResizerMetrics, Filters}
import metrics.FrontendMetric
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*) with CloudWatchApplicationMetrics{
  override def applicationName: String = "png-resizer"

  override def applicationMetrics: List[FrontendMetric] = PngResizerMetrics.all
}
