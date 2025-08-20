import _root_.commercial.targeting.TargetingLifecycle
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import common._
import conf.CachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{ArticleControllers, HealthCheck}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import http.{CommonFilters, CorsHttpErrorHandler}
import jobs.StoreNavigationLifecycleComponent
import model.ApplicationIdentity
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes
import services.newsletters.{NewsletterApi, NewsletterSignupAgent, NewsletterSignupLifecycle}
import services.ophan.SurgingContentAgentLifecycle
import services.{NewspaperBooksAndSectionsAutoRefresh, OphanApi, SkimLinksCacheLifeCycle}

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait AppComponents extends FrontendComponents with ArticleControllers {

  lazy val newsletterApi = wire[NewsletterApi]
  lazy val newsletterSignupAgent = wire[NewsletterSignupAgent]
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val ophanApi = wire[OphanApi]

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]

  lazy val remoteRender = wire[renderers.DotcomRenderingService]

  override lazy val lifecycleComponents = List(
    wire[NewspaperBooksAndSectionsAutoRefresh],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[TargetingLifecycle],
    wire[SkimLinksCacheLifeCycle],
    wire[StoreNavigationLifecycleComponent],
    wire[NewsletterSignupLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("article")

  override lazy val appMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    ContentApiMetrics.ContentApiRequestsMetric,
    DCRMetrics.DCRLatencyMetric,
    DCRMetrics.DCRRequestCountMetric,
  )

  val frontendBuildInfo: FrontendBuildInfo = frontend.article.BuildInfo
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]

  def pekkoActorSystem: PekkoActorSystem
}
