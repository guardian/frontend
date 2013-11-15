import common.CloudWatchApplicationMetrics
import conf.{Management, RequestMeasurementMetrics}
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with DevParametersLifecycle
                                                                                    with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}