import common.CloudWatchApplicationMetrics
import conf.{Management, Filters}
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*) with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}