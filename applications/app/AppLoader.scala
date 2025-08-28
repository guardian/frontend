import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import common.{ApplicationMetrics, CloudWatchMetricsLifecycle, ContentApiMetrics, DCRMetrics, EmailSubsciptionMetrics}
import _root_.commercial.targeting.TargetingLifecycle
import conf.CachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient, SectionsLookUp, SectionsLookUpLifecycle}
import controllers._
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import http.{CommonFilters, CorsHttpErrorHandler}
import jobs.{SiteMapJob, SiteMapLifecycle}
import model.ApplicationIdentity
import services.ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.libs.ws.WSClient
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import services._
import router.Routes
import services.newsletters.{NewsletterApi, NewsletterSignupAgent, NewsletterSignupLifecycle}

import scala.concurrent.ExecutionContext

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait ApplicationsServices {
  def wsClient: WSClient
  implicit val executionContext: ExecutionContext
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val siteMapJob = wire[SiteMapJob]
  lazy val sectionsLookUp = wire[SectionsLookUp]
  lazy val ophanApi = wire[OphanApi]
  lazy val newsletterApi = wire[NewsletterApi]
  lazy val newsletterSignupAgent = wire[NewsletterSignupAgent]
}

trait AppComponents extends FrontendComponents with ApplicationsControllers with ApplicationsServices {

  lazy val devAssetsController = wire[DevAssetsController]
  lazy val healthCheck = wire[HealthCheck]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val surveyPageController = wire[SurveyPageController]
  lazy val signupPageController = wire[SignupPageController]

  override lazy val lifecycleComponents = List(
    wire[ConfigAgentLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[IndexListingsLifecycle],
    wire[SectionsLookUpLifecycle],
    wire[SwitchboardLifecycle],
    wire[SiteMapLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[TargetingLifecycle],
    wire[SkimLinksCacheLifeCycle],
    wire[NewsletterSignupLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("applications")

  override lazy val appMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    ContentApiMetrics.ContentApiRequestsMetric,
    EmailSubsciptionMetrics.EmailSubmission,
    EmailSubsciptionMetrics.EmailFormError,
    EmailSubsciptionMetrics.NotAccepted,
    EmailSubsciptionMetrics.APIHTTPError,
    EmailSubsciptionMetrics.APINetworkError,
    EmailSubsciptionMetrics.ListIDError,
    EmailSubsciptionMetrics.AllEmailSubmission,
    DCRMetrics.DCRLatencyMetric,
    DCRMetrics.DCRRequestCountMetric,
  )

  val frontendBuildInfo: FrontendBuildInfo = frontend.applications.BuildInfo
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]

  def pekkoActorSystem: PekkoActorSystem
}
