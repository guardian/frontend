import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import com.softwaremill.macwire._
import common._
import conf.switches.SwitchboardLifecycle
import controllers.{AdminControllers, HealthCheck}
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
  lazy val redirects = wire[RedirectService]
  lazy val r2PagePressJob = wire[R2PagePressJob]
  lazy val analyticsSanityCheckJob = wire[AnalyticsSanityCheckJob]
  lazy val rebuildIndexJob = wire[RebuildIndexJob]

  lazy val blockingOperations: BlockingOperations = wire[BlockingOperations]
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
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("admin")

  def pekkoActorSystem: PekkoActorSystem

  override lazy val httpFilters: Seq[EssentialFilter] =
    auth.filter :: new RequestIdFilter :: Filters.common(frontend.admin.BuildInfo) ++ wire[CommonGzipFilter].filters

  override lazy val httpErrorHandler: HttpErrorHandler = wire[AdminHttpErrorHandler]
}
