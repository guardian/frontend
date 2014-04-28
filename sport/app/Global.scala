import common.CloudWatchApplicationMetrics
import conf.{Management, Filters}
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*) with DevParametersLifecycle with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}