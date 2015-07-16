import common.CloudWatchApplicationMetrics
import conf.Filters
import dev.DevParametersLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-sport"
}