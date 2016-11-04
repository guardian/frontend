import http.CorsHttpErrorHandler
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonFilters}
import controllers.{ArchiveController, HealthCheck}
import dev.DevParametersHttpRequestHandler
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import services.{ArchiveMetrics, RedirectService}
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait AppComponents extends FrontendComponents {

  lazy val redirects = wire[RedirectService]

  lazy val healthCheck = wire[HealthCheck]
  lazy val archiveController = wire[ArchiveController]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[ArchiveMetrics],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-archive")

  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
}
