import common.CloudWatchApplicationMetrics
import conf.{SwitchboardLifecycle, CorsErrorHandler, Filters}
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters
import services.ArchiveMetrics

object Global extends WithFilters(Filters.common: _*)
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with ArchiveMetrics
  with CorsErrorHandler
  with SwitchboardLifecycle {
  override lazy val applicationName = "frontend-archive"
}
