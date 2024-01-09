import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import com.softwaremill.macwire._
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import dfp._
import common.dfp._
import common._
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import controllers.{AdminControllers, HealthCheck}
import _root_.dfp.DfpDataCacheLifecycle
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import concurrent.BlockingOperations
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import http.{AdminFilters, AdminHttpErrorHandler, CommonGzipFilter}
import dev.DevAssetsController
import jobs._
import model.{AdminLifecycle, ApplicationIdentity}
import services.ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.i18n.I18nComponents
import play.api.libs.ws.WSClient
import services.{ParameterStoreService, _}
import router.Routes

import scala.concurrent.ExecutionContext

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait AdminServices extends I18nComponents {
  def wsClient: WSClient
  def pekkoAsync: PekkoAsync
  def pekkoActorSystem: PekkoActorSystem
  implicit val executionContext: ExecutionContext
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient: ContentApiClient = wire[ContentApiClient]
  lazy val ophanApi: OphanApi = wire[OphanApi]
  lazy val emailService: EmailService = wire[EmailService]
  lazy val fastlyStatisticService: FastlyStatisticService = wire[FastlyStatisticService]
  lazy val fastlyCloudwatchLoadJob: FastlyCloudwatchLoadJob = wire[FastlyCloudwatchLoadJob]
  lazy val redirects: RedirectService = wire[RedirectService]
  lazy val r2PagePressJob: R2PagePressJob = wire[R2PagePressJob]
  lazy val analyticsSanityCheckJob: AnalyticsSanityCheckJob = wire[AnalyticsSanityCheckJob]
  lazy val rebuildIndexJob: RebuildIndexJob = wire[RebuildIndexJob]

  lazy val dfpApi: DfpApi = wire[DfpApi]
  lazy val blockingOperations: BlockingOperations = wire[BlockingOperations]
  lazy val adUnitAgent: AdUnitAgent = wire[AdUnitAgent]
  lazy val adUnitService: AdUnitService = wire[AdUnitService]
  lazy val advertiserAgent: AdvertiserAgent = wire[AdvertiserAgent]
  lazy val creativeTemplateAgent: CreativeTemplateAgent = wire[CreativeTemplateAgent]
  lazy val customFieldAgent: CustomFieldAgent = wire[CustomFieldAgent]
  lazy val customFieldService: CustomFieldService = wire[CustomFieldService]
  lazy val customTargetingAgent: CustomTargetingAgent = wire[CustomTargetingAgent]
  lazy val customTargetingService: CustomTargetingService = wire[CustomTargetingService]
  lazy val customTargetingKeyValueJob: CustomTargetingKeyValueJob = wire[CustomTargetingKeyValueJob]
  lazy val dataMapper: DataMapper = wire[DataMapper]
  lazy val dataValidation: DataValidation = wire[DataValidation]
  lazy val dfpDataCacheJob: DfpDataCacheJob = wire[DfpDataCacheJob]
  lazy val orderAgent: OrderAgent = wire[OrderAgent]
  lazy val placementAgent: PlacementAgent = wire[PlacementAgent]
  lazy val placementService: PlacementService = wire[PlacementService]
  lazy val dfpFacebookIaAdUnitCacheJob: DfpFacebookIaAdUnitCacheJob = wire[DfpFacebookIaAdUnitCacheJob]
  lazy val dfpAdUnitCacheJob: DfpAdUnitCacheJob = wire[DfpAdUnitCacheJob]
  lazy val dfpMobileAppUnitCacheJob: DfpMobileAppAdUnitCacheJob = wire[DfpMobileAppAdUnitCacheJob]
  lazy val dfpTemplateCreativeCacheJob: DfpTemplateCreativeCacheJob = wire[DfpTemplateCreativeCacheJob]
  lazy val parameterStoreService: ParameterStoreService = wire[ParameterStoreService]
  lazy val parameterStoreProvider: ParameterStoreProvider = wire[ParameterStoreProvider]
}

trait AppComponents extends FrontendComponents with AdminControllers with AdminServices {

  lazy val healthCheck: HealthCheck = wire[HealthCheck]
  lazy val devAssetsController: DevAssetsController = wire[DevAssetsController]
  lazy val logbackOperationsPool: LogbackOperationsPool = wire[LogbackOperationsPool]
  override lazy val lifecycleComponents: List[LifecycleComponent] = List(
    wire[LogstashLifecycle],
    wire[AdminLifecycle],
    wire[ConfigAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[DfpAgentLifecycle],
    wire[DfpDataCacheLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[CommercialDfpReportingLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity: ApplicationIdentity = ApplicationIdentity("admin")

  override lazy val appMetrics: ApplicationMetrics = ApplicationMetrics(
    DfpApiMetrics.DfpSessionErrors,
    DfpApiMetrics.DfpApiErrors,
  )

  def pekkoActorSystem: PekkoActorSystem

  override lazy val httpErrorHandler: HttpErrorHandler = wire[AdminHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonGzipFilter].filters ++ wire[AdminFilters].filters
}
