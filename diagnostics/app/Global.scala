
import common.{CloudWatchApplicationMetrics, DiagnosticsLifecycle}
import conf.{Configuration, Gzipper}
import play.api.mvc.WithFilters

object Global extends WithFilters(Gzipper) with DiagnosticsLifecycle with CloudWatchApplicationMetrics {
  override lazy val applicationName = "frontend-diagnostics"
}
