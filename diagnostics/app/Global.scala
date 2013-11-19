
import common.{CloudWatchApplicationMetrics, DiagnosticsLifecycle}
import conf.Management

object Global extends DiagnosticsLifecycle with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}
