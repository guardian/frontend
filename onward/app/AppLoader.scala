import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import http.{CommonFilters, CorsHttpErrorHandler}
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import business.{StocksData, StocksDataLifecycle}
import com.softwaremill.macwire._
import common._
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
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
import weather.WeatherApi
import _root_.commercial.targeting.TargetingLifecycle

import scala.concurrent.ExecutionContext
import agents.DeeplyReadAgent
import renderers.DotcomRenderingService
import app.LifecycleComponent

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
  lazy val contentApiClient: ContentApiClient = wire[ContentApiClient]
  lazy val ophanApi: OphanApi = wire[OphanApi]
  lazy val stocksData: StocksData = wire[StocksData]
  lazy val weatherApi: WeatherApi = wire[WeatherApi]
  lazy val geoMostPopularAgent: GeoMostPopularAgent = wire[GeoMostPopularAgent]
  lazy val dayMostPopularAgent: DayMostPopularAgent = wire[DayMostPopularAgent]
  lazy val mostPopularAgent: MostPopularAgent = wire[MostPopularAgent]
  lazy val mostReadAgent: MostReadAgent = wire[MostReadAgent]
  lazy val mostPopularSocialAutoRefresh: MostPopularSocialAutoRefresh = wire[MostPopularSocialAutoRefresh]
  lazy val mostViewedAudioAgent: MostViewedAudioAgent = wire[MostViewedAudioAgent]
  lazy val mostViewedGalleryAgent: MostViewedGalleryAgent = wire[MostViewedGalleryAgent]
  lazy val mostViewedVideoAgent: MostViewedVideoAgent = wire[MostViewedVideoAgent]
  lazy val deeplyReadAgent: DeeplyReadAgent = wire[DeeplyReadAgent]
  lazy val remoteRenderer: DotcomRenderingService = wire[DotcomRenderingService]
  lazy val popularInTagService: PopularInTagService = wire[PopularInTagService]
}

trait AppComponents extends FrontendComponents with OnwardControllers with OnwardServices {

  lazy val healthCheck: HealthCheck = wire[HealthCheck]
  lazy val devAssetsController: DevAssetsController = wire[DevAssetsController]
  lazy val logbackOperationsPool: LogbackOperationsPool = wire[LogbackOperationsPool]

  override lazy val lifecycleComponents: List[LifecycleComponent] = List(
    wire[LogstashLifecycle],
    wire[OnwardJourneyLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[StocksDataLifecycle],
    wire[MostPopularFacebookAutoRefreshLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[TargetingLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity: ApplicationIdentity = ApplicationIdentity("onward")

  val applicationMetrics: ApplicationMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    ContentApiMetrics.ContentApiRequestsMetric,
  )

  val frontendBuildInfo: FrontendBuildInfo = frontend.onward.BuildInfo
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]

  def pekkoActorSystem: PekkoActorSystem
}
