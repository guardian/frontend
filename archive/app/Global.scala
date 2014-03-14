import common.CloudWatchApplicationMetrics
import conf.{Management, RequestMeasurementMetrics}
import dev.DevParametersLifecycle
import services.ArchiveMetrics
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with DevParametersLifecycle
  with CloudWatchApplicationMetrics with ArchiveMetrics {
  override lazy val applicationName = Management.applicationName
}
