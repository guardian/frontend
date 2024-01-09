import agents.{DeeplyReadAgent, MostViewedAgent}
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import common.dfp.FaciaDfpAgentLifecycle
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
import app.LifecycleComponent

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait FapiServices {
  implicit val executionContext: ExecutionContext
  def wsClient: WSClient
  def pekkoActorSystem: PekkoActorSystem
  lazy val frontJsonFapiLive: FrontJsonFapiLive = wire[FrontJsonFapiLive]
  lazy val frontJsonFapiDraft: FrontJsonFapiDraft = wire[FrontJsonFapiDraft]
  lazy val blockingOperations: BlockingOperations = wire[BlockingOperations]
}

trait AppComponents extends FrontendComponents with FaciaControllers with FapiServices {

  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient: ContentApiClient = wire[ContentApiClient]
  lazy val healthCheck: HealthCheck = wire[HealthCheck]
  lazy val devAssetsController: DevAssetsController = wire[DevAssetsController]
  lazy val ophanApi: OphanApi = wire[OphanApi]
  lazy val logbackOperationsPool: LogbackOperationsPool = wire[LogbackOperationsPool]
  lazy val mostViewedAgent: MostViewedAgent = wire[MostViewedAgent]
  lazy val deeplyReadAgent: DeeplyReadAgent = wire[DeeplyReadAgent]

  override lazy val lifecycleComponents: List[LifecycleComponent] = List(
    wire[LogstashLifecycle],
    wire[ConfigAgentLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[FaciaDfpAgentLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[IndexListingsLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[MostViewedLifecycle],
    wire[DeeplyReadLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity: ApplicationIdentity = ApplicationIdentity("facia")

  override lazy val appMetrics: ApplicationMetrics = ApplicationMetrics(
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
