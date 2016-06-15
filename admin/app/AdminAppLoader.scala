import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import common.dfp.DfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonGzipFilter}
import controllers.HealthCheck
import _root_.dfp.DfpDataCacheLifecycle
import _root_.http.AdminHttpErrorHandler
import model.{ApplicationIdentity, AdminLifecycle}
import ophan.SurgingContentAgentLifecycle
import play.api.http.HttpErrorHandler
import play.api.inject.{NewInstanceInjector, SimpleInjector, Injector}
import play.api.libs.ws.ning.NingWSComponents
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import services.ConfigAgentLifecycle
import router.Routes

import scala.concurrent.ExecutionContext

class AdminAppLoader extends ApplicationLoader {
  override def load(context: ApplicationLoader.Context): Application = {
    Logger.configure(context.environment)
    val components = new BuiltInComponentsFromContext(context) with RoutingComponents
    components.startLifecycleComponents()
    components.application
  }
}

trait AppComponents extends BuiltInComponents with NingWSComponents {
  lazy val appIdentity = ApplicationIdentity("frontend-admin")
  lazy val appMetrics = ApplicationMetrics()
  implicit lazy val executionContext: ExecutionContext = actorSystem.dispatcher
  // this is a workaround to make wsapi and the actorsystem available to the injector.
  // I'm forced to do that as we still use Ws.url and Akka.system(app) *everywhere*, and both directly get the reference from the injector
  override lazy val injector: Injector = new SimpleInjector(NewInstanceInjector) + router + crypto + httpConfiguration + wsApi + actorSystem
}

trait Controllers {
  lazy val healthCheck = HealthCheck
}

trait AdminLifecycleComponents extends LifecycleComponents {
  self: AppComponents with Controllers =>

  lazy val jobScheduler = wire[JobScheduler]
  lazy val akkaAsync = wire[AkkaAsync]

  override lazy val lifecycleComponents = List(
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

trait RoutingComponents extends AdminLifecycleComponents with AppComponents with Controllers {
  lazy val prefix = "/"
  lazy val router: Router = Routes
  override lazy val httpErrorHandler: HttpErrorHandler = wire[AdminHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonGzipFilter].filters
}
