import common.CloudWatchApplicationMetrics
import conf.{Management, Filters}
import dev.DevParametersLifecycle
import services.ArchiveMetrics
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*) with DevParametersLifecycle
  with CloudWatchApplicationMetrics with ArchiveMetrics {
  override lazy val applicationName = Management.applicationName
}
