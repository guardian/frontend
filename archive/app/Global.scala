import common.CloudWatchApplicationMetrics
import conf.{Configuration, Filters}
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters
import services.ArchiveMetrics

object Global extends WithFilters(Filters.common: _*) with DevParametersLifecycle
  with CloudWatchApplicationMetrics with ArchiveMetrics with CorsErrorHandler {
  override lazy val applicationName = "frontend-archive"
}
