import common.{ApplicationMode, CloudWatchApplicationMetrics}
import common.Logback.Logstash
import conf.{SwitchboardLifecycle, CorsErrorHandler, Filters}
import play.api.mvc.{WithFilters}

object Global extends WithFilters(Filters.common : _*)
  with ApplicationMode
  with CloudWatchApplicationMetrics
  with CorsErrorHandler
  with SwitchboardLifecycle
  with Logstash {
  override lazy val applicationName = "frontend-discussion"
}
