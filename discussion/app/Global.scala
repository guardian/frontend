import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import conf._
import filters.{DiscussionRequestLoggingFilter, RequestLoggingFilter}
import play.api.mvc.{EssentialFilter, WithFilters}

object Global extends WithFilters(DiscussionFilters.allFilters : _*)
  with CloudWatchApplicationMetrics
  with CorsErrorHandler
  with SwitchboardLifecycle
  with Logstash
  with DiscussionHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-discussion"
}

object DiscussionFilters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val allFilters: List[EssentialFilter] = List(
    JsonVaryHeadersFilter,
    Gzipper,
    BackendHeaderFilter,
    DiscussionRequestLoggingFilter,
    SurrogateKeyFilter,
    AmpFilter,
    PanicSheddingFilter
  )
}
