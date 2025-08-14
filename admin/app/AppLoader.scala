import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import com.softwaremill.macwire._
import dfp._
import common.dfp._
import common._
import conf.switches.SwitchboardLifecycle
import controllers.{AdminControllers, HealthCheck}
import _root_.dfp.DfpDataCacheLifecycle
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import concurrent.BlockingOperations
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import http.{AdminHttpErrorHandler, CommonGzipFilter, Filters, RequestIdFilter}
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
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val ophanApi = wire[OphanApi]
  lazy val emailService = wire[EmailService]
  lazy val fastlyStatisticService = wire[FastlyStatisticService]
  lazy val fastlyCloudwatchLoadJob = wire[FastlyCloudwatchLoadJob]
  lazy val redirects = wire[RedirectService]
  lazy val r2PagePressJob = wire[R2PagePressJob]
  lazy val analyticsSanityCheckJob = wire[AnalyticsSanityCheckJob]
  lazy val rebuildIndexJob = wire[RebuildIndexJob]

  lazy val dfpApi: DfpApi = wire[DfpApi]
  lazy val blockingOperations: BlockingOperations = wire[BlockingOperations]
  lazy val customFieldAgent: CustomFieldAgent = wire[CustomFieldAgent]
  lazy val customFieldService: CustomFieldService = wire[CustomFieldService]
  lazy val customTargetingAgent: CustomTargetingAgent = wire[CustomTargetingAgent]
  lazy val customTargetingService: CustomTargetingService = wire[CustomTargetingService]
  lazy val customTargetingKeyValueJob: CustomTargetingKeyValueJob = wire[CustomTargetingKeyValueJob]
  lazy val dataMapper: DataMapper = wire[DataMapper]
  lazy val parameterStoreService: ParameterStoreService = wire[ParameterStoreService]
  lazy val parameterStoreProvider: ParameterStoreProvider = wire[ParameterStoreProvider]
}

trait AppComponents extends FrontendComponents with AdminControllers with AdminServices {

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  override lazy val lifecycleComponents: List[LifecycleComponent] = List(
    wire[AdminLifecycle],
    wire[ConfigAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[DfpAgentLifecycle],
    wire[DfpDataCacheLifecycle],
    wire[CommercialDfpReportingLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("admin")

  override lazy val appMetrics = ApplicationMetrics(
    DfpApiMetrics.DfpSessionErrors,
    DfpApiMetrics.DfpApiErrors,
  )

  def pekkoActorSystem: PekkoActorSystem

  override lazy val httpFilters: Seq[EssentialFilter] =
    auth.filter :: new RequestIdFilter :: Filters.common(frontend.admin.BuildInfo) ++ wire[CommonGzipFilter].filters

  override lazy val httpErrorHandler: HttpErrorHandler = wire[AdminHttpErrorHandler]
}
