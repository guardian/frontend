import common.CloudWatchApplicationMetrics
import conf._
import dev.DevParametersLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with SurgingContentAgentLifecycle
  with SwitchboardLifecycle
  with FootballLifecycle
  with CricketLifecycle
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-sport"
}
