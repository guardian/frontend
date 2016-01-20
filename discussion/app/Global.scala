import common.CloudWatchApplicationMetrics
import conf.{SwitchboardLifecycle, CorsErrorHandler, Filters}
import play.api.mvc.{WithFilters}

object Global extends WithFilters(Filters.common : _*)
  with CloudWatchApplicationMetrics
  with CorsErrorHandler
  with SwitchboardLifecycle {
  override lazy val applicationName = "frontend-discussion"
}
