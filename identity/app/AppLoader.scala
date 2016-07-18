import http.IdentityHttpErrorHandler
import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common.CloudWatchMetricsLifecycle
import common.Logback.LogstashLifecycle
import conf._
import conf.switches.SwitchboardLifecycle
import controllers.{IdentityControllers, Assets, HealthCheck}
import dev.DevAssetsController
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api._
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes


class AppLoader extends FrontendApplicationLoader {
  def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends IdentityControllers {
  self: BuiltInComponents with IdentityConfigurationComponents =>
  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val assets = wire[Assets]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers =>

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[IdentityLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with Controllers with AppLifecycleComponents with IdentityConfigurationComponents {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-identity")
  override lazy val httpFilters: Seq[EssentialFilter] = wire[IdentityFilters].filters
  override lazy val httpErrorHandler: HttpErrorHandler = wire[IdentityHttpErrorHandler]
}
