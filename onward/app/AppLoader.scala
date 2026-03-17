import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import http.{CommonFilters, FrontendDefaultHttpErrorHandler}
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import business.{StocksData, StocksDataLifecycle}
import com.softwaremill.macwire._
import common._
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{HealthCheck, OnwardControllers}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import feed._
import model.{ApplicationContext, ApplicationIdentity}
import play.api.ApplicationLoader.Context
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.{BuiltInComponentsFromContext, Environment}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.libs.ws.WSClient
import router.Routes
import services.{OphanApi, PopularInTagService}
import _root_.commercial.targeting.TargetingLifecycle

import scala.concurrent.ExecutionContext
import agents.DeeplyReadAgent
import renderers.DotcomRenderingService

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait OnwardServices {
  def wsClient: WSClient
  def environment: Environment
  def pekkoActorSystem: PekkoActorSystem
  implicit def appContext: ApplicationContext
  implicit val executionContext: ExecutionContext
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val ophanApi = wire[OphanApi]
  lazy val stocksData = wire[StocksData]
  lazy val geoMostPopularAgent = wire[GeoMostPopularAgent]
  lazy val dayMostPopularAgent = wire[DayMostPopularAgent]
  lazy val mostPopularAgent = wire[MostPopularAgent]
  lazy val mostReadAgent = wire[MostReadAgent]
  lazy val mostViewedAudioAgent = wire[MostViewedAudioAgent]
  lazy val mostViewedGalleryAgent = wire[MostViewedGalleryAgent]
  lazy val mostViewedVideoAgent = wire[MostViewedVideoAgent]
  lazy val deeplyReadAgent = wire[DeeplyReadAgent]
  lazy val remoteRenderer = wire[DotcomRenderingService]
  lazy val popularInTagService = wire[PopularInTagService]
}

trait AppComponents extends FrontendComponents with OnwardControllers with OnwardServices {

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]

  override lazy val lifecycleComponents = List(
    wire[OnwardJourneyLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[StocksDataLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[TargetingLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("onward")

  val applicationMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    ContentApiMetrics.ContentApiRequestsMetric,
  )

  val frontendBuildInfo: FrontendBuildInfo = frontend.onward.BuildInfo
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
  override lazy val httpErrorHandler: HttpErrorHandler = wire[FrontendDefaultHttpErrorHandler]

  def pekkoActorSystem: PekkoActorSystem
}
