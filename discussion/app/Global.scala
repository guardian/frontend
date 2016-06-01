import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents, CloudWatchApplicationMetrics}
import common.Logback.Logstash
import conf._
import conf.switches.SwitchboardLifecycle
import controllers.HealthCheck
import filters.RequestLoggingFilter
import play.api.GlobalSettings
import play.api.http.HttpFilters
import play.api.inject.ApplicationLifecycle
import play.api.mvc.EssentialFilter

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with CloudWatchApplicationMetrics
  with SwitchboardLifecycle
  with Logstash {
  override lazy val applicationName = "frontend-discussion"

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new InjectedCachedHealthCheckLifeCycle(HealthCheck)
  )
}

class DiscussionFilters extends HttpFilters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val filters: List[EssentialFilter] = List(
    new PanicSheddingFilter,
    new JsonVaryHeadersFilter,
    new Gzipper,
    new BackendHeaderFilter,
    new RequestLoggingFilter,
    new SurrogateKeyFilter,
    new AmpFilter
  )
}
