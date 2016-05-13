import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import conf._
import filters.DiscussionRequestLoggingFilter
import play.api.http.HttpFilters
import play.api.mvc.EssentialFilter

object Global extends CloudWatchApplicationMetrics
  with CorsErrorHandler
  with SwitchboardLifecycle
  with Logstash
  with DiscussionHealthCheckLifeCycle {
  override lazy val applicationName = "frontend-discussion"
}

class DiscussionFilters extends HttpFilters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val filters: List[EssentialFilter] = List(
    new JsonVaryHeadersFilter,
    new Gzipper,
    new BackendHeaderFilter,
    new DiscussionRequestLoggingFilter,
    new SurrogateKeyFilter,
    new AmpFilter,
    new PanicSheddingFilter
  )
}
