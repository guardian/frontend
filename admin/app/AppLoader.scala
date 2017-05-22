import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import dfp.DfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import controllers.{AdminControllers, HealthCheck}
import _root_.dfp.DfpDataCacheLifecycle
import akka.actor.ActorSystem
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import http.{AdminFilters, AdminHttpErrorHandler, CommonGzipFilter}
import dev.DevAssetsController
import football.feed.MatchDayRecorder
import jobs._
import model.{AdminLifecycle, ApplicationIdentity}
import services.ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.i18n.{I18nComponents, Lang, Messages}
import play.api.libs.ws.WSClient
import services._
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait AdminServices extends I18nComponents  {
  def wsClient: WSClient
  def akkaAsync: AkkaAsync
  def actorSystem: ActorSystem
  lazy val messages: Messages = Messages(Lang.defaultLang, messagesApi)
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val ophanApi = wire[OphanApi]
  lazy val emailService = wire[EmailService]
  lazy val fastlyStatisticService = wire[FastlyStatisticService]
  lazy val fastlyCloudwatchLoadJob = wire[FastlyCloudwatchLoadJob]
  lazy val redirects = wire[RedirectService]
  lazy val r2PagePressJob = wire[R2PagePressJob]
  lazy val videoEncodingsJob = wire[VideoEncodingsJob]
  lazy val matchDayRecorder = wire[MatchDayRecorder]
  lazy val analyticsSanityCheckJob = wire[AnalyticsSanityCheckJob]
  lazy val rebuildIndexJob = wire[RebuildIndexJob]
}

trait AppComponents extends FrontendComponents with AdminControllers with AdminServices {

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]

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
    wire[CommercialClientSideLoggingLifecycle]
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("admin")

  override lazy val httpErrorHandler: HttpErrorHandler = wire[AdminHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonGzipFilter].filters ++ wire[AdminFilters].filters
}
