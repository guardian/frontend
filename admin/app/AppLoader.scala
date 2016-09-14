import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import dfp.{CapiLookupAgent, DfpAgentLifecycle}
import conf.switches.SwitchboardLifecycle
import conf.{AdminFilters, CachedHealthCheckLifeCycle, CommonGzipFilter}
import controllers.{AdminControllers, HealthCheck}
import _root_.dfp.{DfpDataCacheJob, DfpDataCacheLifecycle}
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import http.AdminHttpErrorHandler
import dev.DevAssetsController
import football.feed.MatchDayRecorder
import jobs._
import model.{AdminLifecycle, ApplicationIdentity}
import ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import play.api.libs.ws.WSClient
import services.{ConfigAgentLifecycle, EmailService, FastlyStatisticService, OphanApi}
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait AdminServices {
  def wsClient: WSClient
  def akkaAsync: AkkaAsync
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val ophanApi = wire[OphanApi]
  lazy val emailService = wire[EmailService]
  lazy val fastlyStatisticService = wire[FastlyStatisticService]
  lazy val fastlyCloudwatchLoadJob = wire[FastlyCloudwatchLoadJob]
  lazy val r2PagePressJob = wire[R2PagePressJob]
  lazy val videoEncodingsJob = wire[VideoEncodingsJob]
  lazy val matchDayRecorder = wire[MatchDayRecorder]
  lazy val analyticsSanityCheckJob = wire[AnalyticsSanityCheckJob]
  lazy val capiLookupAgent = wire[CapiLookupAgent]
  lazy val dfpDataCacheJob = wire[DfpDataCacheJob]
  lazy val rebuildIndexJob = wire[RebuildIndexJob]
}

trait Controllers extends AdminControllers {
  def wsClient: WSClient
  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
}

trait AdminLifecycleComponents {
  self: AppComponents with Controllers with AdminServices =>

  override lazy val lifecycleComponents: List[LifecycleComponent] = List(
    wire[LogstashLifecycle],
    wire[AdminLifecycle],
    wire[ConfigAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[DfpAgentLifecycle],
    wire[DfpDataCacheLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AdminLifecycleComponents with Controllers with AdminServices {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-admin")

  override lazy val httpErrorHandler: HttpErrorHandler = wire[AdminHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonGzipFilter].filters ++ wire[AdminFilters].filters
}
