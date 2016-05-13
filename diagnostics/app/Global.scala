
import common.Logback.Logstash
import common.{CloudWatchApplicationMetrics, DiagnosticsLifecycle}
import conf.{DiagnosticsHealthCheckLifeCycle, Gzipper, SwitchboardLifecycle}
import play.api.mvc.WithFilters

object Global extends WithFilters(Gzipper)
  with DiagnosticsLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with Logstash
  with DiagnosticsHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-diagnostics"
}
