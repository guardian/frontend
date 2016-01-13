import common.CloudWatchApplicationMetrics
import conf.{SwitchboardLifecycle, CorsErrorHandler, Filters}
import play.api.mvc.{EssentialFilter, WithFilters}
import play.filters.csrf.CSRFFilter

object DiscussionFilters {
  def apply(): List[EssentialFilter] = CSRFFilter() +: Filters.common
}

object Global extends WithFilters(DiscussionFilters(): _*)
  with CloudWatchApplicationMetrics
  with CorsErrorHandler
  with SwitchboardLifecycle {
  override lazy val applicationName = "frontend-discussion"
}
