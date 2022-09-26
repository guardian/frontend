import _root_.commercial.targeting.TargetingLifecycle
import agents.CuratedContentAgent
import akka.actor.ActorSystem
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common.Assets.DiscussionExternalAssetsLifecycle
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import common._
import common.dfp.DfpAgentLifecycle
import concurrent.BlockingOperations
import conf.CachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{ArticleControllers, HealthCheck}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import http.{CommonFilters, CorsHttpErrorHandler}
import jobs.{StoreNavigationLifecycleComponent, TopicLifecycle}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes
import services.dotcomrendering.OnwardsPicker
import services.fronts.FrontJsonFapiLive
import services.newsletters.{NewsletterApi, NewsletterSignupAgent, NewsletterSignupLifecycle}
import services.ophan.SurgingContentAgentLifecycle
import services.{NewspaperBooksAndSectionsAutoRefresh, OphanApi, SkimLinksCacheLifeCycle}
import topics.{TopicS3Client, TopicS3ClientImpl, TopicService}

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait TopicServices {
  lazy val topicS3Client: TopicS3Client = wire[TopicS3ClientImpl]
  lazy val topicService = wire[TopicService]
}

trait AppComponents extends FrontendComponents with ArticleControllers with TopicServices {

  lazy val newsletterApi = wire[NewsletterApi]
  lazy val newsletterSignupAgent = wire[NewsletterSignupAgent]
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val ophanApi = wire[OphanApi]

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val logbackOperationsPool = wire[LogbackOperationsPool]

  lazy val remoteRender = wire[renderers.DotcomRenderingService]

  lazy val onwardsPicker = wire[OnwardsPicker]
  lazy val curatedContentAgent = wire[CuratedContentAgent]

  lazy val frontJsonFapiLive = wire[FrontJsonFapiLive]
  lazy val blockingOperations = wire[BlockingOperations]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[NewspaperBooksAndSectionsAutoRefresh],
    wire[DfpAgentLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[TargetingLifecycle],
    wire[DiscussionExternalAssetsLifecycle],
    wire[SkimLinksCacheLifeCycle],
    wire[StoreNavigationLifecycleComponent],
    wire[TopicLifecycle],
    wire[NewsletterSignupLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("article")

  override lazy val appMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    ContentApiMetrics.ContentApiRequestsMetric,
    ArticleRenderingMetrics.RemoteRenderingMetric,
    ArticleRenderingMetrics.LocalRenderingMetric,
  )

  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]

  def actorSystem: ActorSystem
}
