import http.CorsHttpErrorHandler
import app.{FrontendApplicationLoader, FrontendComponents}
import business.{StocksData, StocksDataLifecycle}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonFilters}
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{HealthCheck, OnwardControllers}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import feed._
import model.{ApplicationContext, ApplicationIdentity}
import play.api.ApplicationLoader.Context
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import play.api.libs.ws.WSClient
import router.Routes
import services.OphanApi
import weather.WeatherApi

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait OnwardServices {
  def wsClient: WSClient
  def environment: Environment
  implicit def appContext: ApplicationContext
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val ophanApi = wire[OphanApi]
  lazy val stocksData = wire[StocksData]
  lazy val weatherApi = wire[WeatherApi]
  lazy val geoMostPopularAgent = wire[GeoMostPopularAgent]
  lazy val dayMostPopularAgent = wire[DayMostPopularAgent]
  lazy val mostPopularAgent = wire[MostPopularAgent]
  lazy val mostPopularExpandableAgent = wire[MostPopularExpandableAgent]
  lazy val mostReadAgent = wire[MostReadAgent]
  lazy val mostPopularSocialAutoRefresh = wire[MostPopularSocialAutoRefresh]
  lazy val mostViewedAudioAgent = wire[MostViewedAudioAgent]
  lazy val mostViewedGalleryAgent = wire[MostViewedGalleryAgent]
  lazy val mostViewedVideoAgent = wire[MostViewedVideoAgent]
}

trait AppComponents extends FrontendComponents with OnwardControllers with OnwardServices {

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[OnwardJourneyLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[MostReadLifecycle],
    wire[StocksDataLifecycle],
    wire[MostPopularFacebookAutoRefreshLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("onward")

  val applicationMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )

  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
}
