import common.CloudWatchApplicationMetrics
import conf.{Management, RequestMeasurementMetrics}
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}