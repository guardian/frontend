import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonGzipFilter}
import controllers.{Assets, DiagnosticsControllers, HealthCheck}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import play.api.libs.ws.WSClient
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends DiagnosticsControllers {
  self: BuiltInComponents =>
  def wsClient: WSClient
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
