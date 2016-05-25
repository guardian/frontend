import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import conf.{ArchiveHealthCheckLifeCycle, CorsErrorHandler, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import services.ArchiveMetrics

object Global extends DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with ArchiveMetrics
  with CorsErrorHandler
  with SwitchboardLifecycle
  with Logstash
  with ArchiveHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-archive"
}
