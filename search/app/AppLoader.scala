import akka.actor.ActorSystem
import http.{CommonFilters, CorsHttpErrorHandler}
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{HealthCheck, SearchController}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import model.{ApplicationContext, ApplicationIdentity}
import play.api.ApplicationLoader.Context
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.{BuiltInComponentsFromContext, Environment}
import play.api.mvc.{ControllerComponents, EssentialFilter}
import play.api.routing.Router
import play.api.libs.ws.WSClient
import router.Routes

import scala.concurrent.ExecutionContext

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait SearchControllers {
  def contentApiClient: ContentApiClient
  def wsClient: WSClient
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext
  lazy val searchController = wire[SearchController]
}

trait SearchServices {
  def wsClient: WSClient
  def environment: Environment
  def actorSystem: ActorSystem
  implicit def appContext: ApplicationContext
  implicit val executionContext: ExecutionContext
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
}

trait AppComponents extends FrontendComponents with SearchControllers with SearchServices {

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val logbackOperationsPool = wire[LogbackOperationsPool]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("search")

  val applicationMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    ContentApiMetrics.ContentApiRequestsMetric,
  )

  val frontendBuildInfo: FrontendBuildInfo = frontend.search.BuildInfo
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]

  def actorSystem: ActorSystem
}
