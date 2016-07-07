import common.{CloudWatchMetricsLifecycle, LifecycleComponent, BackwardCompatibleLifecycleComponents}
import common.Logback.LogstashLifecycle
import conf._
import conf.switches.SwitchboardLifecycle
import controllers.HealthCheck
import filters.RequestLoggingFilter
import model.ApplicationIdentity
import play.api.inject.ApplicationLifecycle
import play.api.GlobalSettings
import play.api.http.HttpFilters
import play.api.mvc.EssentialFilter

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {
  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-discussion")),
    new SwitchboardLifecycle(appLifecycle),
    LogstashLifecycle,
    new CachedHealthCheckLifeCycle(HealthCheck)
  )
}

class DiscussionFilters extends HttpFilters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val filters: List[EssentialFilter] = List(
    new RequestLoggingFilter,
    new PanicSheddingFilter,
    new JsonVaryHeadersFilter,
    new Gzipper,
    new BackendHeaderFilter,
    new SurrogateKeyFilter,
    new AmpFilter
  )
}
