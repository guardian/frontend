import app.{LifecycleComponent, FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import common.dfp.DfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonGzipFilter}
import controllers.{AdminControllers, HealthCheck}
import _root_.dfp.DfpDataCacheLifecycle
import http.AdminHttpErrorHandler
import dev.DevAssetsController
import model.{ApplicationIdentity, AdminLifecycle}
import ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import services.ConfigAgentLifecycle
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends AdminControllers {
  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
}

trait AdminLifecycleComponents {
  self: AppComponents with Controllers =>

  override lazy val lifecycleComponents: List[LifecycleComponent] = List(
    wire[LogstashLifecycle],
    wire[AdminLifecycle],
    wire[ConfigAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[DfpAgentLifecycle],
    wire[DfpDataCacheLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AdminLifecycleComponents with Controllers {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-admin")

  override lazy val httpErrorHandler: HttpErrorHandler = wire[AdminHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonGzipFilter].filters
}
