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
import play.api.libs.ws.WSClient
import services.{ArchiveMetrics, DynamoDB}
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait ArchiveServices {
  def wsClient: WSClient
  lazy val dynamoDB = wire[DynamoDB]
}

trait Controllers {
  def wsClient: WSClient
  def dynamoDB: DynamoDB
  lazy val healthCheck = wire[HealthCheck]
  lazy val archiveController = wire[ArchiveController]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers =>

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[ArchiveMetrics],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers with ArchiveServices {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-archive")

  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
}
