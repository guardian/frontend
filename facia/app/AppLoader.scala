import agents.{DeeplyReadAgent, MostViewedAgent}
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import common._
import concurrent.BlockingOperations
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{FaciaControllers, HealthCheck}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import feed.{DeeplyReadLifecycle, MostViewedLifecycle}
import http.CommonFilters
import model.ApplicationIdentity
import services.ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.HttpRequestHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.libs.ws.WSClient
import services._
import services.fronts.{FrontJsonFapiDraft, FrontJsonFapiLive}
import router.Routes

import scala.concurrent.ExecutionContext

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait FapiServices {
  implicit val executionContext: ExecutionContext
  def wsClient: WSClient
  def pekkoActorSystem: PekkoActorSystem
  lazy val frontJsonFapiLive = wire[FrontJsonFapiLive]
  lazy val frontJsonFapiDraft = wire[FrontJsonFapiDraft]
  lazy val blockingOperations = wire[BlockingOperations]
}

trait AppComponents extends FrontendComponents with FaciaControllers with FapiServices {

  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val ophanApi = wire[OphanApi]
  lazy val mostViewedAgent = wire[MostViewedAgent]
  lazy val deeplyReadAgent = wire[DeeplyReadAgent]

  override lazy val lifecycleComponents = List(
    wire[ConfigAgentLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[IndexListingsLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[MostViewedLifecycle],
    wire[DeeplyReadLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("facia")

  override lazy val appMetrics = ApplicationMetrics(
    FaciaPressMetrics.FrontDecodingLatency,
    FaciaPressMetrics.FrontDownloadLatency,
    FaciaPressMetrics.FrontNotModifiedDownloadLatency,
    DCRMetrics.DCRLatencyMetric,
    DCRMetrics.DCRRequestCountMetric,
  )

  val frontendBuildInfo: FrontendBuildInfo = frontend.facia.BuildInfo
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]

  def pekkoActorSystem: PekkoActorSystem
}
