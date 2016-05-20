import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import conf.{ArchiveHealthCheckLifeCycle, CorsErrorHandler, Filters, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters
import services.ArchiveMetrics

object Global extends WithFilters(Filters.common: _*)
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with ArchiveMetrics
  with CorsErrorHandler
  with SwitchboardLifecycle
  with Logstash
  with ArchiveHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-archive"
}
