import common.CloudWatchApplicationMetrics
import conf.{Configuration, Filters}
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*) with CloudWatchApplicationMetrics {
  override lazy val applicationName = "frontend-discussion"
}