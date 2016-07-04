import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CommonGzipFilter, CachedHealthCheckLifeCycle}
import controllers.{Assets, DiagnosticsControllers, HealthCheck}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends DiagnosticsControllers {
  self: BuiltInComponents =>
  lazy val healthCheck = wire[HealthCheck]
  lazy val assets = wire[Assets]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers =>

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[DiagnosticsLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers {
  lazy val router: Router = wire[Routes]
  lazy val appIdentity = ApplicationIdentity("frontend-diagnostics")
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonGzipFilter].filters
}
