import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import conf.{CorsErrorHandler, DiscussionHealthCheckLifeCycle, Filters, SwitchboardLifecycle}
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common : _*)
  with CloudWatchApplicationMetrics
  with CorsErrorHandler
  with SwitchboardLifecycle
  with Logstash
  with DiscussionHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-discussion"
}
