
import common.{CloudWatchApplicationMetrics, DiagnosticsLifecycle}
import conf.{Gzipper, Management}
import play.api.mvc.WithFilters

object Global extends WithFilters(Gzipper) with DiagnosticsLifecycle with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}
