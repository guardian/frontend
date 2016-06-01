import common.Logback.Logstash
import common.{CloudWatchApplicationMetrics, DiagnosticsLifecycle}
import conf.DiagnosticsHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle

object Global
  extends DiagnosticsLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with Logstash
  with DiagnosticsHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-diagnostics"
}
