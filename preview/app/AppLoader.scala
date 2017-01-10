import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import com.softwaremill.macwire._
import commercial.CommercialLifecycle
import commercial.controllers.CommercialControllers
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import conf.{CachedHealthCheckLifeCycle, FootballLifecycle}
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers._
import controllers.front.FrontJsonFapiDraft
import cricket.conf.CricketLifecycle
import cricket.controllers.CricketControllers
import dev.DevAssetsController
import feed.OnwardJourneyLifecycle
import football.controllers.FootballControllers
import http.PreviewFilters
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.{BuiltInComponents, BuiltInComponentsFromContext}
import play.api.http.HttpErrorHandler
import play.api.libs.ws.WSClient
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes
import rugby.conf.RugbyLifecycle
import rugby.controllers.RugbyControllers
import services.{ConfigAgentLifecycle, OphanApi}

trait PreviewLifecycleComponents extends SportServices with CommercialServices with FapiServices with OnwardServices {
  self: FrontendComponents =>

  //Override conflicting members
  override lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  override lazy val contentApiClient = wire[ContentApiClient]
  override lazy val ophanApi = wire[OphanApi]

  def standaloneLifecycleComponents: List[LifecycleComponent] = List(
    wire[LogstashLifecycle],
    wire[CommercialLifecycle],
    wire[OnwardJourneyLifecycle],
    wire[ConfigAgentLifecycle],
    wire[FaciaDfpAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[FootballLifecycle],
    wire[CricketLifecycle],
    wire[RugbyLifecycle]
  )
}

trait PreviewControllerComponents
  extends ApplicationsControllers
    with AdminJobsControllers
    with ArticleControllers
    with CommercialControllers
    with FaciaControllers
    with OnwardControllers
    with FootballControllers
    with CricketControllers
    with FrontendComponents
    with RugbyControllers {
  self: BuiltInComponents =>

  def wsClient: WSClient
  def frontJsonFapiDraft: FrontJsonFapiDraft

  lazy val assets = wire[Assets]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val faciaDraftController = wire[FaciaDraftController]
  lazy val faviconController = wire[FaviconController]
  lazy val itemController = wire[ItemController]
  lazy val oAuthLoginController = wire[OAuthLoginPreviewController]
}

trait AppComponents
  extends FrontendComponents
  with PreviewControllerComponents
  with PreviewLifecycleComponents
  with AdminJobsServices
  with OnwardServices
  with ApplicationsServices {

  override lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  override lazy val contentApiClient = wire[ContentApiClient]
  override lazy val ophanApi = wire[OphanApi]

  lazy val healthCheck = wire[HealthCheck]
  lazy val responsiveViewerController = wire[ResponsiveViewerController]

  lazy val router: Router = wire[Routes]
  override def appIdentity: ApplicationIdentity = ApplicationIdentity("preview")

  override def lifecycleComponents: List[LifecycleComponent] = standaloneLifecycleComponents :+ wire[CachedHealthCheckLifeCycle]

  override lazy val httpFilters: Seq[EssentialFilter] = wire[PreviewFilters].filters
  override lazy val httpErrorHandler: HttpErrorHandler = wire[PreviewErrorHandler]
}

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

