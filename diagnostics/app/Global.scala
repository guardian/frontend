
import common.Logback.Logstash
import common.{CloudWatchApplicationMetrics, DiagnosticsLifecycle}
import conf.{SwitchboardLifecycle, Gzipper}
import play.api.mvc.WithFilters

object Global extends WithFilters(Gzipper)
  with DiagnosticsLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with Logstash {
  override lazy val applicationName = "frontend-diagnostics"
}
