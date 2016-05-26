import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import conf.switches.SwitchboardLifecycle
import conf.ArchiveHealthCheckLifeCycle
import services.ArchiveMetrics

object Global extends CloudWatchApplicationMetrics
  with ArchiveMetrics
  with SwitchboardLifecycle
  with Logstash
  with ArchiveHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-archive"
}
