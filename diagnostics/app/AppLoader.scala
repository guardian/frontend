import akka.actor.ActorSystem
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import controllers.{Assets, AssetsComponents, DiagnosticsControllers, HealthCheck}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import http.CommonGzipFilter
import play.api.{BuiltInComponents, BuiltInComponentsFromContext}
import play.api.libs.ws.WSClient
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends DiagnosticsControllers {
  self: BuiltInComponents =>
  def wsClient: WSClient
  lazy val healthCheck = wire[HealthCheck]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers =>

  lazy val logbackOperationsPool = wire[LogbackOperationsPool]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[DiagnosticsLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[CachedHealthCheckLifeCycle],
  )

  def actorSystem: ActorSystem
}

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers {
  lazy val router: Router = wire[Routes]
  lazy val appIdentity = ApplicationIdentity("diagnostics")
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonGzipFilter].filters
}
