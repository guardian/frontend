import agents.MostViewedAgent
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import com.amazonaws.regions.Regions
import com.amazonaws.services.s3.AmazonS3ClientBuilder
import com.softwaremill.macwire._
import commercial.controllers.CommercialControllers
import commercial.targeting.TargetingLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import common.{ApplicationMetrics, CloudWatchMetricsLifecycle, ContentApiMetrics, DCRMetrics}
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, FootballLifecycle}
import contentapi._
import controllers._
import cricket.conf.CricketLifecycle
import cricket.controllers.CricketControllers
import dev.DevAssetsController
import feed.OnwardJourneyLifecycle
import football.controllers.FootballControllers
import http.{
  Filters,
  GuardianAuthWithExemptions,
  PreviewContentSecurityPolicyFilter,
  PreviewNoCacheFilter,
  RequestIdFilter,
  routes,
}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.http.HttpErrorHandler
import play.api.libs.ws.WSClient
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.{BuiltInComponents, BuiltInComponentsFromContext}
import router.Routes
import rugby.conf.RugbyLifecycle
import rugby.controllers.RugbyControllers
import services.fronts.FrontJsonFapiDraft
import services.newsletters.NewsletterSignupLifecycle
import services.{ConfigAgentLifecycle, OphanApi, SkimLinksCacheLifeCycle}
import conf.Configuration.aws.mandatoryCredentials

trait PreviewLifecycleComponents
    extends SportServices
    with CommercialServices
    with FapiServices
    with OnwardServices
    with ApplicationsServices {
  self: FrontendComponents =>

  // Override conflicting members
  override lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  override lazy val contentApiClient = wire[ContentApiClient]
  override lazy val ophanApi = wire[OphanApi]

  def standaloneLifecycleComponents: List[LifecycleComponent] =
    List(
      wire[OnwardJourneyLifecycle],
      wire[ConfigAgentLifecycle],
      wire[FaciaDfpAgentLifecycle],
      wire[SwitchboardLifecycle],
      wire[FootballLifecycle],
      wire[CricketLifecycle],
      wire[RugbyLifecycle],
      wire[TargetingLifecycle],
      wire[SkimLinksCacheLifeCycle],
      wire[CloudWatchMetricsLifecycle],
      wire[NewsletterSignupLifecycle],
    )

  def pekkoActorSystem: PekkoActorSystem
}

trait PreviewControllerComponents
    extends ApplicationsControllers
    with ArticleControllers
    with CommercialControllers
    with FaciaControllers
    with OnwardControllers
    with FootballControllers
    with CricketControllers
    with FrontendComponents
    with RugbyControllers
    with ApplicationsServices {
  self: BuiltInComponents =>

  def wsClient: WSClient
  def frontJsonFapiDraft: FrontJsonFapiDraft

  lazy val devAssetsController = wire[DevAssetsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val faciaDraftController = wire[FaciaDraftController]
  lazy val faviconController = wire[FaviconController]
  lazy val itemController = wire[ItemController]
  lazy val mostViewedAgent = wire[MostViewedAgent]
}

trait AppComponents
    extends FrontendComponents
    with PreviewControllerComponents
    with PreviewLifecycleComponents
    with OnwardServices
    with ApplicationsServices {

  private lazy val s3Client =
    AmazonS3ClientBuilder.standard().withRegion(Regions.EU_WEST_1).withCredentials(mandatoryCredentials).build()

  private lazy val auth = new GuardianAuthWithExemptions(
    controllerComponents,
    wsClient,
    toolsDomainPrefix = "preview",
    oauthCallbackPath = routes.GuardianAuthWithExemptions.oauthCallback.path,
    s3Client,
    system = "preview",
    extraDoNotAuthenticatePathPrefixes = healthCheck.healthChecks.map(_.path),
    requiredEditorialPermissionName = "preview_access",
  )

  override lazy val capiHttpClient: HttpClient = new CapiHttpClient(wsClient) {
    override val signer = Some(PreviewSigner())
  }
  override lazy val contentApiClient = wire[PreviewContentApi]
  override lazy val ophanApi = wire[OphanApi]

  override lazy val appMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    ContentApiMetrics.ContentApiRequestsMetric,
    DCRMetrics.DCRLatencyMetric,
    DCRMetrics.DCRRequestCountMetric,
  )

  lazy val healthCheck: HealthCheck = wire[HealthCheck]
  lazy val responsiveViewerController = wire[ResponsiveViewerController]

  lazy val router: Router = wire[Routes]
  override def appIdentity: ApplicationIdentity = ApplicationIdentity("preview")

  override def lifecycleComponents: List[LifecycleComponent] =
    standaloneLifecycleComponents :+ wire[CachedHealthCheckLifeCycle]

  override lazy val httpFilters: Seq[EssentialFilter] =
    auth.filter :: new PreviewNoCacheFilter :: new PreviewContentSecurityPolicyFilter :: new RequestIdFilter :: Filters
      .common(
        frontend.preview.BuildInfo,
      )

  override lazy val httpErrorHandler: HttpErrorHandler = wire[PreviewErrorHandler]
}

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}
